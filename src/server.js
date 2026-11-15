const express = require("express");

const app = express();
app.use(express.json());

const services = [
  { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
  { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
];

const reviews = [
  { id: "rv_001", serviceId: "svc_001", authorName: "Hung", rating: 5, comment: "Hay qua" }
];
let nextReviewNumber = reviews.length + 1;

const bookings = [];
let nextBookingNumber = 1;

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

function findReview(id) {
  return reviews.find((item) => item.id === id);
}

function isValidAuthorName(value) {
  return typeof value === "string"
    && value.trim() !== "";
}

function isValidRating(value) {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= 1
    && value <= 5;
}

function validateReview(body, { requireAll }) {
  const { authorName, rating, comment } = body;

  if (requireAll) {
    if (authorName === undefined || rating === undefined || comment === undefined) {
      return "Missing required fields (authorName, rating, comment)";
    }
  } else if (authorName === undefined || rating === undefined) {
    return "Missing required fields (authorName, rating)";
  }

  if (!isValidAuthorName(authorName)) {
    return "authorName must be a non-empty string";
  }
  if (!isValidRating(rating)) {
    return "Invalid rating (1-5)";
  }
  if (comment !== undefined && typeof comment !== "string") {
    return "comment must be a string";
  }
  return null;
}

// 1
app.get("/api/v1/services/:serviceId/reviews", (req, res) => {
  const { serviceId } = req.params;
  if (!findService(serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const serviceReviews = reviews.filter((r) => r.serviceId === serviceId);
  res.status(200).json(serviceReviews);
});

// 2
app.post("/api/v1/services/:serviceId/reviews", (req, res) => {
  const body = req.body || {};
  const error = validateReview(body, { requireAll: false });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const { serviceId } = req.params;
  if (!findService(serviceId)) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const review = {
    id: "rv_" + String(nextReviewNumber++).padStart(3, "0"),
    serviceId,
    authorName: body.authorName.trim(),
    rating: body.rating,
    comment: body.comment ?? "",
  };
  reviews.push(review);
  res.status(201).json(review);
});

// 3
app.get("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);
  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }
  res.status(200).json(review);
});

// 4
app.put("/api/v1/reviews/:id", (req, res) => {
  const body = req.body || {};
  const error = validateReview(body, { requireAll: true });
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const review = findReview(req.params.id);
  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  review.authorName = body.authorName.trim();
  review.rating = body.rating;
  review.comment = body.comment;
  res.status(200).json(review);
});

// 5
app.patch("/api/v1/reviews/:id", (req, res) => {
  const body = req.body || {};
  const { authorName, rating, comment } = body;

  if (authorName === undefined && rating === undefined && comment === undefined) {
    res.status(400).json({ message: "Missing required fields (authorName or rating or comment)" });
    return;
  }
  if (authorName !== undefined && !isValidAuthorName(authorName)) {
    res.status(400).json({ message: "authorName must be a non-empty string" });
    return;
  }
  if (rating !== undefined && !isValidRating(rating)) {
    res.status(400).json({ message: "Invalid rating (1-5)" });
    return;
  }
  if (comment !== undefined && typeof comment !== "string") {
    res.status(400).json({ message: "comment must be a string" });
    return;
  }

  const review = findReview(req.params.id);
  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  if (authorName !== undefined) review.authorName = authorName.trim();
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  res.status(200).json(review);
});

// 6
app.delete("/api/v1/reviews/:id", (req, res) => {
  const index = reviews.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  reviews.splice(index, 1);
  res.status(204).send();
});

const port = 3000;
app.listen(port, () => {
  console.log("Booking demo listening on http://localhost:" + port);
});
