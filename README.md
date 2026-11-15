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
## Exercise — Service reviews

### Part A — Spec

| Method | Path | Body | Success | Error |
|--------|------|------|---------|-------|
| GET | `/api/v1/services/:serviceId/reviews` | — | 200 array of reviews for that service | 404 service not found |
| POST | `/api/v1/services/:serviceId/reviews` | `authorName` (required), `rating` 1–5 (required), `comment` (optional, default `""`) | 201 new review; server sets `id` and `serviceId` | 400 missing field or `rating` outside 1–5, 404 service not found |
| GET | `/api/v1/reviews/:id` | — | 200 one review | 404 review not found |
| PUT | `/api/v1/reviews/:id` | `authorName`, `rating`, `comment` (all required) | 200 replaced review | 400 missing field or bad `rating`, 404 review not found |
| PATCH | `/api/v1/reviews/:id` | one or more of `authorName`, `rating`, `comment` | 200; only the fields sent change | 400 empty body `{}` or bad value, 404 review not found |
| DELETE | `/api/v1/reviews/:id` | — | 204 no body | 404 review not found |

Errors use `{ "message": "..." }`. A body that is not valid JSON returns `400` and `{ "message": "Invalid JSON body" }` on every route.
### Part B — curl commands I ran

```bash
# 1. Tạo review -> 201
curl -i -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" -d "{\"authorName\":\"Lan\",\"rating\":5,\"comment\":\"Great service\"}"

# 2. Liệt kê review -> 200
curl -i http://localhost:3000/api/v1/services/svc_001/reviews

# 3. Lấy một review -> 200
curl -i http://localhost:3000/api/v1/reviews/rev_001

# 4. PATCH rating -> 200
curl -i -X PATCH http://localhost:3000/api/v1/reviews/rev_001 -H "Content-Type: application/json" -d "{\"rating\":4}"

# 5. Rating ngoài 1-5 -> 400, body { "message": "..." }
curl -i -X POST http://localhost:3000/api/v1/services/svc_001/reviews -H "Content-Type: application/json" -d "{\"authorName\":\"Minh\",\"rating\":9}"

# 6. Review không tồn tại -> 404
curl -i http://localhost:3000/api/v1/reviews/rev_999
```
### Part C — Explain

1. The list belongs to one service, so it is nested under `/services/:serviceId/reviews`; this makes the parent clear and lets the server check that the service exists. One review has its own unique `id`, so `/reviews/:id` finds it without the service id and keeps the path short.
2. Successful create: `201`. Missing `rating`: `400`. Service does not exist: `404`.
3. First, check who sent the review (login), so only real customers can write reviews and only the author can edit or delete them. Next, keep data after the process stops (a database), because a restart currently drops every review. A limit on reviews per service matters less: it does not stop fake reviews, and listing can be paged later.

