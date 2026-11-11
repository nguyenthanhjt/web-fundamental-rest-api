# Exercise — Service reviews

Run and read `src/server.js`. The Booking API is already there. Do not change those routes.

Add a **review** resource (a rating of one service) in the same project. Use the rules from the course: the path is a noun, the method is the verb, the status code is the result, the body is JSON, and the server assigns `id`.

Write the spec on paper before you open the editor.

## Part A — Spec

Write a table for all six endpoints below. Each row needs: method, path, body when there is one, the success response, and the status when the call fails.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/services/:serviceId/reviews` | List reviews for one service |
| POST | `/api/v1/services/:serviceId/reviews` | Create a review for that service |
| GET | `/api/v1/reviews/:id` | One review |
| PUT | `/api/v1/reviews/:id` | Replace the whole review |
| PATCH | `/api/v1/reviews/:id` | Update one or more fields |
| DELETE | `/api/v1/reviews/:id` | Delete a review |

Fields the client may send:

- `authorName` (string, required on create)
- `rating` (number from 1 to 5, required on create)
- `comment` (string, may be empty)

The server sets `id` and `serviceId` on create. The client does not send `id`.

Errors, same shape as the demo:

- A required field is missing, or `rating` is outside 1–5: `400` and `{ "message": "..." }`
- The service or the review does not exist: `404` and `{ "message": "..." }`
- Created: `201` and the new review
- Deleted: `204`, no body

PUT must receive `authorName`, `rating`, and `comment`. PATCH changes only the fields present in the body. PATCH with `{}` is `400`.

In the spec, add one sentence: why creating a review with POST is not idempotent, and why listing reviews with GET is.

## Part B — Code

Add the routes in `src/server.js`. Leave the booking routes as they are.

- Store reviews in their own array, the same way `bookings` is stored.
- `express.json()` is already registered. Do not add a database.
- A review can be created only when the service exists. Use the seed id `svc_001`.
- `DELETE` does not check login yet.

Your README must list six `curl` commands you actually ran, including one `400` and one `404`.

## Part C — Explain when you submit

Answer briefly:

1. Why does the review list live at `/services/:serviceId/reviews`, while one review lives at `/reviews/:id`?
2. Which status do you return for a successful create, a missing `rating`, and a service that does not exist?
3. What would you add before this API runs for real users? Pick from these, no code required: keep data after the process stops, check who sent the review, limit how many reviews one service can have.
