const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.ADMIN_EMAIL = 'admin@example.test';
process.env.ADMIN_PASSWORD = 'Admin-test-password!';
process.env.PORT = '0';
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { AppModule } = require('../dist/app.module.js');
const { configureApp } = require('../dist/setup-app.js');
const { UsersService } = require('../dist/users/users.service.js');
const { validateEnvironment } = require('../dist/config/environment.js');

// The same app modules, middleware, validation, guards and HTTP pipeline as production.
test('authentication and resource authorization over HTTP', async (t) => {
  const app = await NestFactory.create(AppModule, { logger: false, bodyParser: false, abortOnError: false });
  app.useBodyParser('json', { limit: '16kb' });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  t.after(() => app.close());
  const base = await app.getUrl();
  const password = 'Test-password-123!';
  const A = 'a@example.test';
  const B = 'b@example.test';
  let tokenA, tokenB, tokenAdmin, userA, bookingId, reviewId;
  const booking = { serviceId: 'svc_001', date: '2026-11-20', timeSlot: '09:00', customerName: 'Customer A' };
  const review = { authorName: 'Author A', rating: 5, comment: 'Good service' };

  async function request(method, path, body, token, expected) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(base + '/api/v1' + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    assert.equal(response.status, expected, `${method} ${path}: ${text}`);
    if (expected === 204) { assert.equal(text, ''); return; }
    return { ...JSON.parse(text), headers: response.headers };
  }

  await t.test('public services and reviews; security/cache headers; no session cookie', async () => {
    const result = await request('GET', '/services', undefined, undefined, 200);
    assert.equal(result.data.length, 2);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(result.headers.get('set-cookie'), null);
    await request('GET', '/services/svc_001', undefined, undefined, 200);
    await request('GET', '/services/unknown', undefined, undefined, 404);
    await request('GET', '/reviews', undefined, undefined, 200);
    await request('GET', '/services/svc_001/reviews', undefined, undefined, 200);
    await request('GET', '/services/unknown/reviews', undefined, undefined, 404);
  });
  await t.test('registration normalizes email and never exposes password/hash', async () => {
    const result = await request('POST', '/auth/register', { email: `  ${A.toUpperCase()}  `, password }, undefined, 201);
    userA = result.data;
    assert.equal(userA.email, A);
    assert.equal(userA.role, 'user');
    assert.equal(userA.passwordHash, undefined);
    assert.equal(userA.password, undefined);
    const stored = app.get(UsersService).findById(userA.id);
    assert.notEqual(stored.passwordHash, password);
    assert.match(stored.passwordHash, /^\$2[aby]\$/);
    await request('POST', '/auth/register', { email: A, password }, undefined, 409);
    await request('POST', '/auth/register', { email: B, password }, undefined, 201);
  });
  await t.test('reject invalid registration and client-controlled role', async () => {
    await request('POST', '/auth/register', { email: 'x@example.test', password, role: 'admin' }, undefined, 400);
    await request('POST', '/auth/register', { email: 'invalid', password: '123' }, undefined, 400);
    await request('POST', '/auth/register', { email: 'x@example.test', password: '😀'.repeat(19) }, undefined, 400);
    await request('POST', '/auth/register', [], undefined, 400);
  });
  await t.test('concurrent registrations cannot create duplicate accounts', async () => {
    const results = await Promise.all([1, 2].map(() => fetch(base + '/api/v1/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'race@example.test', password }),
    })));
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    await Promise.all(results.map(r => r.text()));
  });
  await t.test('login returns bounded JWT and generic failure messages', async () => {
    tokenA = (await request('POST', '/auth/login', { email: A, password }, undefined, 200)).data.access_token;
    tokenB = (await request('POST', '/auth/login', { email: B, password }, undefined, 200)).data.access_token;
    const admin = await request('POST', '/auth/login', {
      email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD,
    }, undefined, 200);
    tokenAdmin = admin.data.access_token;
    assert.equal(admin.data.token_type, 'Bearer');
    assert.equal(admin.data.expires_in, 900);
    const claims = JSON.parse(Buffer.from(tokenA.split('.')[1], 'base64url'));
    assert.equal(claims.exp - claims.iat, 900);
    assert.equal(claims.sub, userA.id);
    assert.equal(claims.iss, 'booking-api');
    const wrong = await request('POST', '/auth/login', { email: A, password: 'wrong' }, undefined, 401);
    const missing = await request('POST', '/auth/login', { email: 'missing@example.test', password: 'wrong' }, undefined, 401);
    assert.equal(wrong.message, missing.message);
  });
  await t.test('me requires a valid bearer token', async () => {
    const unauthenticated = await request('GET', '/auth/me', undefined, undefined, 401);
    assert.equal(unauthenticated.headers.get('www-authenticate'), 'Bearer');
    await request('GET', '/auth/me', undefined, 'abc', 401);
    const result = await request('GET', '/auth/me', undefined, tokenA, 200);
    assert.equal(result.data.id, userA.id);
    assert.equal(result.data.passwordHash, undefined);
  });
  await t.test('reject expired, forged, wrong-audience, missing-expiry and unknown-user JWT', async () => {
    const jwt = app.get(JwtService);
    const expired = await jwt.signAsync({ sub: userA.id }, { expiresIn: -1 });
    const forged = await jwt.signAsync({ sub: userA.id }, { secret: randomBytes(32).toString('hex') });
    const wrongAudience = await jwt.signAsync({ sub: userA.id }, { audience: 'different-client' });
    const unknownUser = await jwt.signAsync({ sub: 'nonexistent-user' });
    const jsonwebtoken = require('jsonwebtoken');
    const noExpiry = jsonwebtoken.sign({ sub: userA.id }, process.env.JWT_SECRET, {
      algorithm: 'HS256', issuer: 'booking-api', audience: 'booking-api-client',
    });
    for (const token of [expired, forged, wrongAudience, unknownUser, noExpiry]) {
      await request('GET', '/auth/me', undefined, token, 401);
    }
  });
  await t.test('admin-only users endpoint hides hashes and ignores role in signed JWT', async () => {
    await request('GET', '/users', undefined, undefined, 401);
    await request('GET', '/users', undefined, tokenA, 403);
    const falseAdmin = await app.get(JwtService).signAsync({ sub: userA.id, role: 'admin' });
    await request('GET', '/users', undefined, falseAdmin, 403);
    const result = await request('GET', '/users', undefined, tokenAdmin, 200);
    assert.ok(result.data.some(user => user.role === 'admin'));
    assert.ok(result.data.every(user => !('passwordHash' in user) && !('password' in user)));
  });
  await t.test('all booking methods require authentication', async () => {
    for (const [method, path, body] of [
      ['GET', '/bookings'], ['GET', '/bookings/bkg_001'], ['POST', '/bookings', booking],
      ['PUT', '/bookings/bkg_001', booking], ['PATCH', '/bookings/bkg_001', { customerName: 'X' }],
      ['DELETE', '/bookings/bkg_001'],
    ]) await request(method, path, body, undefined, 401);
  });
  await t.test('booking DTO validation prevents mass assignment and bad values', async () => {
    for (const body of [
      {}, { ...booking, ownerId: 'other' }, { ...booking, status: 'APPROVED' },
      { ...booking, customerName: '   ' }, { ...booking, timeSlot: '25:70' },
      { ...booking, date: '2026-02-30' }, { ...booking, date: '2026-11-20T00:00:00Z' },
      { ...booking, serviceId: 1 },
    ]) await request('POST', '/bookings', body, tokenA, 400);
    await request('POST', '/bookings', { ...booking, serviceId: 'unknown' }, tokenA, 404);
  });
  await t.test('booking owner is assigned by server and lists are scoped', async () => {
    const result = await request('POST', '/bookings', booking, tokenA, 201);
    bookingId = result.data.id;
    assert.equal(result.data.ownerId, userA.id);
    assert.equal((await request('GET', '/bookings', undefined, tokenA, 200)).data.length, 1);
    assert.equal((await request('GET', '/bookings', undefined, tokenB, 200)).data.length, 0);
    assert.equal((await request('GET', '/bookings', undefined, tokenAdmin, 200)).data.length, 1);
  });
  await t.test('another user cannot read, replace, patch or delete booking', async () => {
    const path = `/bookings/${bookingId}`;
    for (const [method, body] of [['GET'], ['PUT', booking], ['PATCH', { customerName: 'B' }], ['DELETE']]) {
      await request(method, path, body, tokenB, 403);
    }
  });
  await t.test('owner and admin can update booking without changing ownership', async () => {
    const path = `/bookings/${bookingId}`;
    await request('PUT', path, { ...booking, customerName: 'Updated' }, tokenA, 200);
    for (const body of [{}, { ownerId: 'other' }, { date: null }, { customerName: '' }, { timeSlot: 'bad' }]) {
      await request('PATCH', path, body, tokenA, 400);
    }
    const result = await request('PATCH', path, { timeSlot: '10:30' }, tokenAdmin, 200);
    assert.equal(result.data.ownerId, userA.id);
    assert.equal(result.data.timeSlot, '10:30');
    await request('GET', '/bookings/missing', undefined, tokenA, 404);
  });
  await t.test('review writes require login but reads remain public', async () => {
    for (const [method, path, body] of [
      ['POST', '/services/svc_001/reviews', review], ['PUT', '/reviews/rev_001', review],
      ['PATCH', '/reviews/rev_001', { rating: 4 }], ['DELETE', '/reviews/rev_001'],
    ]) await request(method, path, body, undefined, 401);
    await request('POST', '/services/missing/reviews', review, tokenA, 404);
  });
  await t.test('review validation rejects invalid rating, null and injected ownership', async () => {
    for (const body of [
      { ...review, ownerId: 'other' }, { ...review, rating: 1.5 }, { ...review, rating: 6 },
      { ...review, rating: '5' }, { ...review, comment: null }, { ...review, authorName: ' ' },
    ]) await request('POST', '/services/svc_001/reviews', body, tokenA, 400);
  });
  await t.test('review ownership and public reads', async () => {
    const result = await request('POST', '/services/svc_001/reviews', review, tokenA, 201);
    reviewId = result.data.id;
    assert.equal(result.data.ownerId, userA.id);
    await request('GET', `/reviews/${reviewId}`, undefined, undefined, 200);
    assert.equal((await request('GET', '/services/svc_001/reviews', undefined, undefined, 200)).data.length, 1);
    for (const [method, body] of [['PUT', review], ['PATCH', { rating: 1 }], ['DELETE']]) {
      await request(method, `/reviews/${reviewId}`, body, tokenB, 403);
    }
  });
  await t.test('review owner/admin updates; empty PATCH rejected; empty comment allowed', async () => {
    const path = `/reviews/${reviewId}`;
    await request('PUT', path, review, tokenA, 200);
    await request('PUT', path, { rating: 4 }, tokenA, 400);
    for (const body of [{}, { ownerId: 'other' }, { rating: null }, { comment: null }]) {
      await request('PATCH', path, body, tokenA, 400);
    }
    const result = await request('PATCH', path, { comment: '' }, tokenA, 200);
    assert.equal(result.data.comment, '');
    await request('PATCH', path, { rating: 4 }, tokenAdmin, 200);
    await request('PATCH', '/reviews/missing', { rating: 4 }, tokenA, 404);
  });
  await t.test('owner/admin deletes return truly empty 204 responses', async () => {
    await request('DELETE', `/bookings/${bookingId}`, undefined, tokenAdmin, 204);
    await request('GET', `/bookings/${bookingId}`, undefined, tokenA, 404);
    await request('DELETE', `/reviews/${reviewId}`, undefined, tokenA, 204);
    await request('GET', `/reviews/${reviewId}`, undefined, undefined, 404);
    const result = await request('POST', '/services/svc_001/reviews', review, tokenA, 201);
    await request('DELETE', `/reviews/${result.data.id}`, undefined, tokenAdmin, 204);
    const own = await request('POST', '/bookings', booking, tokenA, 201);
    await request('DELETE', `/bookings/${own.data.id}`, undefined, tokenA, 204);
  });
  await t.test('malformed JSON returns a client error without a stack trace', async () => {
    const response = await fetch(base + '/api/v1/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` }, body: '{',
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.stack, undefined);
    assert.equal(body.success, false);
  });
  await t.test('oversized JSON body is rejected', async () => {
    const response = await fetch(base + '/api/v1/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ ...booking, customerName: 'x'.repeat(17000) }),
    });
    assert.equal(response.status, 413);
    await response.text();
  });
  await t.test('login attempts are rate limited', async () => {
    let limited = false;
    for (let i = 0; i < 11; i++) {
      const response = await fetch(base + '/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: A, password: 'wrong' }),
      });
      const body = await response.json();
      if (response.status === 429) {
        assert.equal(body.statusCode, 429);
        assert.ok(response.headers.get('retry-after'));
        limited = true; break;
      }
      assert.equal(response.status, 401);
    }
    assert.ok(limited);
  });
});

test('configuration fails fast for missing/weak secret and invalid port', () => {
  for (const config of [{}, { JWT_SECRET: 'weak' }, { JWT_SECRET: 'x'.repeat(32), PORT: 'bad' }]) {
    assert.throws(() => validateEnvironment(config));
  }
  assert.equal(validateEnvironment({ JWT_SECRET: 'x'.repeat(32) }).PORT, 3000);
});
