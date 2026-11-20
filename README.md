# Course 3 demo — Booking API (Express, in-memory)

There is no database. Restarting the process drops every booking. There is no login yet: DELETE does not check permission.

Paths match the Booking App slides, prefix `/api/v1`. PUT is extra compared with the Proposed Endpoints table, so the CRUD slide has both replace and partial update.

Student exercise (new resource, do not rebuild these routes): [EXERCISE.md](EXERCISE.md) · [EXERCISE.en.md](EXERCISE.en.md).

## Run

```bash
npm install --registry https://registry.npmjs.org
npm start
```

If `npm install` returns 401, this machine is pointed at an internal registry. The command above installs `express` from the public registry.

Server: `http://localhost:3000`

## Try the API

Run these from the `demo` folder. `bkg_001` is the id the server returns from POST. Change the id if you create more than one booking.

```bash
curl.exe http://localhost:3000/api/v1/services
curl.exe http://localhost:3000/api/v1/services/svc_001
curl.exe http://localhost:3000/api/v1/services/khong-co
curl.exe -X POST http://localhost:3000/api/v1/bookings -H "Content-Type: application/json" --data-binary "@requests/booking-create.json"
curl.exe http://localhost:3000/api/v1/bookings
curl.exe http://localhost:3000/api/v1/bookings/bkg_001
curl.exe -X PUT http://localhost:3000/api/v1/bookings/bkg_001 -H "Content-Type: application/json" --data-binary "@requests/booking-put.json"
curl.exe -X PATCH http://localhost:3000/api/v1/bookings/bkg_001 -H "Content-Type: application/json" --data-binary "@requests/booking-patch.json"
curl.exe -X POST http://localhost:3000/api/v1/bookings -H "Content-Type: application/json" --data-binary "@requests/empty.json"
curl.exe -X DELETE http://localhost:3000/api/v1/bookings/bkg_001
```

## Routes

| Method | Path | Success | Error |
|--------|------|---------|-------|
| GET | `/api/v1/services` | 200 array | |
| GET | `/api/v1/services/:id` | 200 one service | 404 |
| POST | `/api/v1/bookings` | 201 booking; server sets `id` and `status: PENDING` | 400 missing field, 404 unknown service |
| GET | `/api/v1/bookings` | 200 array | |
| GET | `/api/v1/bookings/:id` | 200 one booking | 404 |
| PUT | `/api/v1/bookings/:id` | 200; replaces `serviceId`, `date`, `timeSlot`, and `customerName` | 400 missing field, 404 booking or service |
| PATCH | `/api/v1/bookings/:id` | 200; only the fields sent | 400 empty body, 404 |
| DELETE | `/api/v1/bookings/:id` | 204 no body | 404 |

Create-booking body, as on the slide:

```json
{
  "serviceId": "svc_001",
  "date": "2026-11-15",
  "timeSlot": "10:00",
  "customerName": "Alex Nguyen"
}
```

Seed: `svc_001`, `svc_002`.


# Homework

## Commands:

```bash
curl.exe http://localhost:3000/api/v1/services/svc_001/reviews
curl.exe -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" --data-binary "@requests/review-create.json"
curl.exe http://localhost:3000/api/v1/reviews/rev_002
curl.exe -X PUT http://localhost:3000/api/v1/reviews/rev_002 -H "Content-Type: application/json" --data-binary "@requests/review-create.json"
curl.exe -i -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" --data-binary "@requests/review-invalid.json"
curl.exe -i http://localhost:3000/api/v1/services/unknown/reviews
```

## Answers Part C

1. The review list lives at `/services/:serviceId/reviews` because the reviews belong to a particular service. A single review lives `/reviews/:id` because its unique ID identifies it directly.

2. A successful create returns `201`, a missing `rating` returns `400`, and a service that does not exist returns `404`.

3. Before allowing real users to use this API, I would add authentication to verify who submitted each review, so the system knows who submitted each review and can prevent unauthorized changes or deletions



## Authentication and Authorization

I use stateless JWT authentication and resource-based authorization.

### Authentication

- `/api/v1/users/register` creates a user with the `USER` role.
- Passwords are stored as hashes.
- `/api/v1/auth/login` checks the password and returns a signed JWT access token.
- Refresh tokens are disabled.
- Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

- `@Public()` allows public read access and public login/registration.
- `@CurrentUser()` provides the authenticated user to controllers.

### How JWT Works

1. The user registers or logs in.
2. The server issues a JWT containing the user ID.
3. The client sends the JWT with protected requests.
4. The server verifies the signature and loads the current user.
5. Invalid or missing tokens return `401`.

The server does not store user sessions, making authentication stateless.

### Authorization

The app uses **Attribute-Based Access Control (ABAC)**. A policy allows an operation only after evaluating attributes of the authenticated user and the resource.

User attributes include:

- `role`: `USER` or `ADMIN`
- `id`: the authenticated user's ID

Resource attributes include:

- `Booking.ownerId`
- `Review.authorId`

The authorization decision is based on these attributes:

```ts
return user.role === UserRole.ADMIN ||
  booking.ownerId === user.id;
```

```ts
return user.role === UserRole.ADMIN ||
  review.authorId === user.id;
```

Therefore:

- An `ADMIN` can update or delete any booking or review.
- A normal user can update or delete only resources owned by that user.
- Another normal user receives `403 Forbidden`.

The ownership attributes are assigned from `@CurrentUser()` on the server. They are excluded from request DTOs, so clients cannot set or change `ownerId` or `authorId`.

### Why This Method Was Chosen

JWT is suitable for stateless APIs because authentication data travels with each request instead of being stored in server sessions.

ABAC is suitable because each authorization decision combines multiple attributes:

- The user's role and ID.
- The booking or review owner ID.

A role-only approach would allow every normal user to manage every resource or require a separate role for every owner. Comparing the resource's ownership attribute with the authenticated user's ID prevents one user from modifying another user's resource.

The application validates permission in the service after loading the real resource, before changing or deleting it.
