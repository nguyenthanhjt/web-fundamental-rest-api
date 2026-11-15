# Booking API — NestJS

An in-memory REST API built with NestJS, TypeScript, DTO validation, and separate controllers, services, and modules. Data resets when the process stops. There is no authentication; the DELETE endpoints do not check permissions.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm run start:dev
```

The API listens at `http://localhost:3000/api/v1`. To create a production build and run it:

```bash
npm run build
npm start
```

Set `PORT` to change the listening port.

## API routes

All request and response bodies use JSON. Errors have the shape `{ "message": "..." }`.

| Method | Path | Success | Errors |
|--------|------|---------|--------|
| GET | `/api/v1/services` | `200` services array | — |
| GET | `/api/v1/services/:id` | `200` service | `404` service not found |
| GET | `/api/v1/bookings` | `200` bookings array | — |
| GET | `/api/v1/bookings/:id` | `200` booking | `404` booking not found |
| POST | `/api/v1/bookings` | `201` booking; server assigns `id` and `PENDING` status | `400` invalid body, `404` service not found |
| PUT | `/api/v1/bookings/:id` | `200` replaced booking | `400` invalid body, `404` booking or service not found |
| PATCH | `/api/v1/bookings/:id` | `200` updated booking | `400` empty or invalid body, `404` booking or service not found |
| DELETE | `/api/v1/bookings/:id` | `204`, no body | `404` booking not found |
| GET | `/api/v1/services/:serviceId/reviews` | `200` reviews array | `404` service not found |
| POST | `/api/v1/services/:serviceId/reviews` | `201` review; server assigns `id` and `serviceId` | `400` invalid body/rating, `404` service not found |
| GET | `/api/v1/reviews/:id` | `200` review | `404` review not found |
| PUT | `/api/v1/reviews/:id` | `200` replaced review | `400` invalid body/rating, `404` review not found |
| PATCH | `/api/v1/reviews/:id` | `200` updated review | `400` empty or invalid body/rating, `404` review not found |
| DELETE | `/api/v1/reviews/:id` | `204`, no body | `404` review not found |

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

## Project structure

```text
src/
  bookings/    bookings controller, service, module, model, and DTOs
  reviews/     review controllers, service, module, model, and DTOs
  services/    services controller, service, module, and model
  common/      shared HTTP exception filter
  app.module.ts
  main.ts
```
