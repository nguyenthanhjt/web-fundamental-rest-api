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

## Review validation commands run

These six `curl.exe` commands were run against the live server while validating the new review resource:

```bash
curl.exe -sS -w "\nHTTP:%{http_code}\n" http://localhost:3000/api/v1/services/svc_001/reviews
curl.exe -sS -w "\nHTTP:%{http_code}\n" -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" --data-binary "@requests/review-create.json"
curl.exe -sS -w "\nHTTP:%{http_code}\n" http://localhost:3000/api/v1/reviews/rvw_001
curl.exe -sS -w "\nHTTP:%{http_code}\n" -X PATCH http://localhost:3000/api/v1/reviews/rvw_001 -H "Content-Type: application/json" --data-binary "@requests/review-patch.json"
curl.exe -sS -w "\nHTTP:%{http_code}\n" -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" --data-binary "@requests/review-missing-rating.json"
curl.exe -sS -w "\nHTTP:%{http_code}\n" http://localhost:3000/api/v1/reviews/rvw_999
```

## Answer part C

1. Why does the review list live at `/services/:serviceId/reviews`, while one review lives at `/reviews/:id`?

   The review list is a collection scoped to a specific service, so the path must include the parent resource id to identify which service the reviews belong to. A single review is identified by its own unique id, so it lives under `/reviews/:id`.

2. Which status do you return for a successful create, a missing `rating`, and a service that does not exist?

   A successful create returns `201 Created`. A missing `rating` returns `400 Bad Request`. A service that does not exist returns `404 Not Found`.

3. What would you add before this API runs for real users?

   I would add persistence so the data survives after the process stops. In a real API, reviews should not disappear when the server restarts, and keeping them in a database or file store is the most important next step.
