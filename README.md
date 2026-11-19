# Booking API — NestJS Authentication & Authorization

A booking and review API extending the course 4 source with stateless JWT authentication, user/admin roles, and resource ownership checks. Data is stored in memory; no database is required.

**Solution design, authentication flow, rationale, access matrix, and review instructions:** [AUTH_DESIGN.md](AUTH_DESIGN.md).

## Running the Application

Verified with Node.js v26.13.0. From the repository root:

```bash
npm ci
```

If `.env` does not exist, copy `.env.example` to `.env`. Generate a secret with `openssl rand -hex 32` and assign the result to `JWT_SECRET`. To test admin access, configure both `ADMIN_EMAIL` and `ADMIN_PASSWORD`; see the design document for details. Do not commit `.env`.

```bash
npm start
```

`npm start` compiles the current TypeScript source before launching the server. If compilation fails, the application does not start; stale checked-in `dist` files are never used as a fallback. Build dependencies must be installed, so use `npm ci` without omitting devDependencies.

Default server URL: `http://localhost:3000`. API prefix: `/api/v1`.

## Testing

```bash
npm test
```

Import the [Postman collection](requests/auth-authorization.postman_collection.json) to test registration/login for users A and B, resource ownership, validation, and admin access. The collection saves tokens and resource IDs automatically.

Registration, login, service reads, and review reads are public. Bookings require a Bearer token: users can access only their own bookings, while admins can access all bookings. Updating or deleting a review requires ownership or admin privileges. Only admins can list accounts.

Restarting the server clears users, bookings, and reviews. Register and log in again to obtain a new token. Seeded services: `svc_001` and `svc_002`.

## Original Assignment

Resource extension exercise: [EXERCISE.md](EXERCISE.md). The notes below are retained from the previous exercise. The current access matrix and behavior are documented in [AUTH_DESIGN.md](AUTH_DESIGN.md).

## Exercise answers
Method	Path	Body	Success	Failure
GET	/services/:serviceId/reviews	none	200, array of reviews	404 service not found
POST	/services/:serviceId/reviews	authorName, rating, optional comment	201, new review	400 missing field or rating outside 1–5; 404 service not found
GET	/reviews/:id	none	200, review	404 review not found
PUT	/reviews/:id	authorName, rating, comment (all required)	200, updated review	400 missing or invalid; 404 review not found
PATCH	/reviews/:id	at least one of the three fields	200, updated review	400 empty or invalid; 404 review not found
DELETE	/reviews/:id	none	204, no body	404 review not found


1. The review list is under /services/:serviceId/reviews because those reviews belong to a specific service. A single review has its own ID, so it can be accessed directly at /reviews/:id.
2. Successful creation: 201; missing rating: 400; service not found: 404.
3. Before running this API in production, I would persist the data, verify who submitted each review, and limit the number of reviews per service.
