# Course 6  — Booking API (NEST, Database)

Paths match the Booking App slides, prefix `/api/v1`. PUT is extra compared with the Proposed Endpoints table, so the CRUD slide has both replace and partial update.

Student exercise (new resource, do not rebuild these routes): [EXERCISE.md](EXERCISE.md) · [EXERCISE.en.md](EXERCISE.en.md).

## Start the database

```bash
docker run --name course-6-db -e POSTGRES_USER=course-6 -e POSTGRES_PASSWORD=course-6 -e POSTGRES_DB=course-6 -p 5432:5432 -d postgres:16-alpine
```

## Run

```bash
pnpm install
pnpm start
```

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
