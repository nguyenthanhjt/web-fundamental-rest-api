const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/server');

test('PATCH accepts string comments and preserves omitted fields', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = (path, method = 'GET', body) => fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const created = await request('/services/svc_001/reviews', 'POST', {
    authorName: 'An', rating: 5, comment: 'Nhận xét ban đầu',
  });
  assert.equal(created.status, 201);
  let expected = await created.json();
  const path = `/reviews/${expected.id}`;

  for (const body of [{ comment: '' }, { comment: '   ' }, { rating: 3, comment: '' }]) {
    const response = await request(path, 'PATCH', body);
    assert.equal(response.status, 200);
    expected = { ...expected, ...body };
    assert.deepEqual(await response.json(), expected);
    assert.deepEqual(await (await request(path)).json(), expected);
  }

  // Omitting comment must keep its previous value.
  const updated = await request(path, 'PATCH', { authorName: 'Binh' });
  assert.equal(updated.status, 200);
  expected = { ...expected, authorName: 'Binh' };
  assert.deepEqual(await updated.json(), expected);

  for (const comment of [null, 42, false, {}, []]) {
    const response = await request(path, 'PATCH', { rating: 4, comment });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: 'comment must be a string' });
    assert.deepEqual(await (await request(path)).json(), expected);
  }

  const invalidRating = await request(path, 'PATCH', { rating: 6, comment: '' });
  assert.equal(invalidRating.status, 400);
  assert.deepEqual(await (await request(path)).json(), expected);
});
