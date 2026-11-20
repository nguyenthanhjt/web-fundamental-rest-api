const express = require("express");

const app = express();
app.use(express.json());

const services = [
  { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
  { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
];

const bookings = [];
let nextBookingNumber = 1;

const reviews = [];
let nextReviewNumber = 1;

const writableFields = ["serviceId", "date", "timeSlot", "customerName"];

function findService(id) {
  return services.find((item) => item.id === id);
}

function findBooking(id) {
  return bookings.find((item) => item.id === id);
}

app.get("/api/v1/services", (_req, res) => {
  res.status(200).json(services);
});

app.get("/api/v1/services/:id", (req, res) => {
  const service = findService(req.params.id);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  res.status(200).json(service);
});

app.get("/api/v1/bookings", (_req, res) => {
  res.status(200).json(bookings);
});

app.get("/api/v1/bookings/:id", (req, res) => {
  const booking = findBooking(req.params.id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  res.status(200).json(booking);
});

app.post("/api/v1/bookings", (req, res) => {
  const body = req.body || {};
  const missing = writableFields.filter((field) => !body[field]);
  if (missing.length > 0) {
    res.status(400).json({ message: missing.join(", ") + " are required" });
    return;
  }
  if (!findService(body.serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const booking = {
    id: "bkg_" + String(nextBookingNumber).padStart(3, "0"),
    serviceId: body.serviceId,
    date: body.date,
    timeSlot: body.timeSlot,
    customerName: body.customerName,
    status: "PENDING",
  };
  nextBookingNumber += 1;
  bookings.push(booking);
  res.status(201).json(booking);
});

app.put("/api/v1/bookings/:id", (req, res) => {
  const booking = findBooking(req.params.id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const body = req.body || {};
  const missing = writableFields.filter((field) => !body[field]);
  if (missing.length > 0) {
    res.status(400).json({ message: missing.join(", ") + " are required" });
    return;
  }
  if (!findService(body.serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  booking.serviceId = body.serviceId;
  booking.date = body.date;
  booking.timeSlot = body.timeSlot;
  booking.customerName = body.customerName;
  res.status(200).json(booking);
});

app.patch("/api/v1/bookings/:id", (req, res) => {
  const booking = findBooking(req.params.id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const body = req.body || {};
  const fields = writableFields.filter((field) => body[field]);
  if (fields.length === 0) {
    res.status(400).json({ message: "At least one of serviceId, date, timeSlot, customerName is required" });
    return;
  }
  if (body.serviceId && !findService(body.serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  fields.forEach((field) => {
    booking[field] = body[field];
  });
  res.status(200).json(booking);
});

app.delete("/api/v1/bookings/:id", (req, res) => {
  const index = bookings.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  bookings.splice(index, 1);
  res.status(204).send();
});

const port = 3000;

function findReview(id) {
  return reviews.find((item) => item.id === id);
}

function valitateReviewBody(body, requiredAllFields) {
  const fields = ["authorName", "rating", "comment"];

  if (requiredAllFields && fields.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) {
    return "authorName, rating, comment are required";
  }

  if (Object.prototype.hasOwnProperty.call(body, "authorName") && typeof body.authorName !== "string") {
    return "authorName must be a string";
  }

  if (Object.prototype.hasOwnProperty.call(body, "rating") && (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5)) {
    return "rating must be a number between 1 and 5";
  }

  if (Object.prototype.hasOwnProperty.call(body, "comment") && typeof body.comment !== "string") {
    return "comment must be a string";
  }

  return null;
}

app.get("/api/v1/services/:serviceId/reviews", (req, res) => {
  if (!findService(req.params.serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  res.status(200).json(reviews.filter((review) => review.serviceId === req.params.serviceId));
});

app.post("/api/v1/services/:serviceId/reviews", (req, res) => {
  if (!findService(req.params.serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const body = req.body || {};
  const error = valitateReviewBody(body, true);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const review = {
    id: "rev_" + String(nextReviewNumber).padStart(3, "0"),
    serviceId: req.params.serviceId,
    authorName: body.authorName,
    rating: body.rating,
    comment: body.comment
  };
  nextReviewNumber += 1;
  reviews.push(review);
  res.status(201).json(review);
});

app.get("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);

  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  res.status(200).json(review);
});

app.put("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);

  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  const body = req.body || {};
  const error = valitateReviewBody(body, true);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  review.authorName = body.authorName;
  review.rating = body.rating;
  review.comment = body.comment;

  res.status(200).json(review);
});

app.patch("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);

  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  const body = req.body || {};

  if (Object.keys(body).length === 0) {
    if (Object.keys(body).length === 0) {
      res.status(400).json({ message: "At least one of authorName, rating, comment is required" });
      return;
    }
  }

  const error = valitateReviewBody(body, false);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  ["authorName", "rating", "comment"].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      review[field] = body[field];
    }
  });

  res.status(200).json(review);
});

app.delete("/api/v1/reviews/:id", (req, res) => {
  const index = reviews.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  reviews.splice(index, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log("Booking demo listening on http://localhost:" + port);
});
