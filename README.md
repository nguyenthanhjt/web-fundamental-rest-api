# Booking API - NestJS

A REST API built with NestJS and TypeScript. It includes PostgreSQL-backed authentication, refresh-token rotation, and role-based authorization. Booking and review data is currently kept in memory and resets when the process stops.

## Requirements

- Node.js 20 or newer
- npm
- Docker with Docker Compose

## Install and run

```bash
npm install
docker compose up -d
Copy-Item .env.example .env # Windows PowerShell
npm run start:dev
```

Copying `.env.example` is only needed once. Replace `JWT_ACCESS_SECRET` with a long random secret before deployment. PostgreSQL is available on `localhost:5432` by default.

The API listens at `http://localhost:3000/api/v1`. TypeORM creates or updates the PostgreSQL tables while `NODE_ENV` is not `production`.

To create a production build and run it:

```bash
npm run build
npm start
```

Set `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, and `JWT_ACCESS_SECRET` as environment variables to override the defaults.

To stop the database:

```bash
docker compose down
```

## API routes

All request and response bodies use JSON. Public endpoints do not require a bearer token. Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

| Method | Path | Success | Errors |
|--------|------|---------|--------|
| POST | `/api/v1/auth/register` | `201` token pair | `400` invalid body, `409` email exists |
| POST | `/api/v1/auth/login` | `200` token pair | `400` invalid body, `401` invalid credentials |
| POST | `/api/v1/auth/refresh` | `200` rotated token pair | `400` invalid body, `401` invalid/reused refresh token |
| POST | `/api/v1/auth/logout` | `204`, no body | `401` missing/invalid access token |
| GET | `/api/v1/services` | `200` public services array | — |
| GET | `/api/v1/services/:id` | `200` public service | `404` service not found |
| GET | `/api/v1/bookings` | `200` bookings array | `401` missing/invalid access token |
| GET | `/api/v1/bookings/:id` | `200` booking | `401`, `404` booking not found |
| POST | `/api/v1/bookings` | `201` booking; server assigns `id` and `PENDING` status | `400`, `401`, `404` service not found |
| PUT | `/api/v1/bookings/:id` | `200` replaced booking | `400`, `401`, `404` booking or service not found |
| PATCH | `/api/v1/bookings/:id` | `200` updated booking | `400`, `401`, `404` booking or service not found |
| DELETE | `/api/v1/bookings/:id` | `204`, no body | `401`, `403` for non-admin, `404` |
| GET | `/api/v1/services/:serviceId/reviews` | `200` public reviews array | `404` service not found |
| POST | `/api/v1/services/:serviceId/reviews` | `201` review | `400`, `401`, `404` service not found |
| GET | `/api/v1/reviews/:id` | `200` public review | `404` review not found |
| PUT | `/api/v1/reviews/:id` | `200` replaced review | `400`, `401`, `404` review not found |
| PATCH | `/api/v1/reviews/:id` | `200` updated review | `400`, `401`, `404` review not found |
| DELETE | `/api/v1/reviews/:id` | `204`, no body | `401`, `403` for non-admin, `404` |

Booking creation requires `serviceId`, `date`, `timeSlot`, and `customerName`. Review creation requires `authorName` and a numeric `rating` from 1 to 5; `comment` is optional and may be empty. Review PUT requires `authorName`, `rating`, and `comment`; PATCH updates only supplied fields. Seed services: `svc_001` and `svc_002`.

## Example requests

Run these commands from the repository root. The review JSON fixtures are in `requests/`.

```bash
curl.exe http://localhost:3000/api/v1/services
curl.exe http://localhost:3000/api/v1/services/svc_001
curl.exe -X POST http://localhost:3000/api/v1/bookings -H "Content-Type: application/json" --data-binary "@requests/booking-create.json"
curl.exe http://localhost:3000/api/v1/bookings
curl.exe -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" --data-binary "@requests/review-create.json"
curl.exe http://localhost:3000/api/v1/services/svc_001/reviews
curl.exe http://localhost:3000/api/v1/reviews/rvw_001
curl.exe -X PUT http://localhost:3000/api/v1/reviews/rvw_001 -H "Content-Type: application/json" --data-binary "@requests/review-put.json"
curl.exe -X PATCH http://localhost:3000/api/v1/reviews/rvw_001 -H "Content-Type: application/json" --data-binary "@requests/review-patch.json"
curl.exe -X DELETE http://localhost:3000/api/v1/reviews/rvw_001
```

Register and log in before protected requests:

```bash
curl.exe -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" --data-binary "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
curl.exe -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" --data-binary "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

## Course 6 homework

The complete Course 6 assignment notes are in [course-6-homework.md](./course-6-homework.md). It documents access and refresh tokens, refresh-token reuse detection, logout, RBAC, the protected endpoint matrix, and PostgreSQL setup.

For local development, a newly registered account has the `USER` role. To grant administrator access in PostgreSQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## Project structure

```text
src/
  auth/        authentication, authorization, JWT, refresh tokens, and policies
  bookings/    booking controller, service, module, model, and DTOs
  reviews/     review controllers, service, module, model, and DTOs
  services/    services controller, service, module, and model
  common/      shared HTTP exception filter
  app.module.ts
  main.ts
```
