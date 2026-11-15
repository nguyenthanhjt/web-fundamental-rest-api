const express = require("express");

const app = express();
app.use(express.json());

const services = [
  { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
  { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
];
const reviews = [];
let nextReviewNumber = 1;
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

app.get("/api/v1/services/:serviceId/reviews", (req, res) => {
  const service = findService(req.params.serviceId);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  const serviceReviews = reviews.filter((item) => item.serviceId === req.params.serviceId);
  res.status(200).json(serviceReviews);
})

app.post("/api/v1/services/:serviceId/reviews", (req, res) => {
  const service = findService(req.params.serviceId);
  if (!service) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  const body = req.body || {};
  if (typeof body.authorName !== "string" || !body.authorName.trim() || body.rating === undefined) {
    res.status(400).json({ message: "authorName and rating are required" });
    return;
  }
  if (typeof body.rating !== "number" || !Number.isFinite(body.rating) || body.rating < 1 || body.rating > 5) {
    res.status(400).json({ message: "rating must be between 1 and 5" });
    return;
  }
  if (body.comment !== undefined && typeof body.comment !== "string") {
    res.status(400).json({ message: "comment must be a string" });
    return;
  }

  const review = {
    id: "rev_" + String(nextReviewNumber).padStart(3, "0"),
    serviceId: req.params.serviceId,
    authorName: body.authorName,
    rating: body.rating,
    comment: body.comment ?? "",
  };
  nextReviewNumber += 1;
  reviews.push(review);
  res.status(201).json(review);
});

app.get("/api/v1/reviews/:id", (req, res) => {
  const review = reviews.find((item) => item.id === req.params.id);
  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }
  res.status(200).json(review);
});

app.put("/api/v1/reviews/:id", (req, res) => {
  const review = reviews.find((item) => item.id === req.params.id);
  if (!review) {
    res.status(404).json({ message: "Review not found" });
    return;
  }

  const body = req.body || {};
  if (
    typeof body.authorName !== "string" ||
    !body.authorName.trim() ||
    body.rating === undefined ||
    body.comment === undefined
  ) {
    return res.status(400).json({
      message: "authorName, rating and comment are required",
    });
  }
  if (
    typeof body.rating !== "number" ||
    !Number.isFinite(body.rating) ||
    body.rating < 1 || body.rating > 5
  ) {
    return res.status(400).json({ message: "rating must be between 1 and 5" });
  }
  if (typeof body.comment !== "string") {
    return res.status(400).json({ message: "comment must be a string" });
  }

  const newReview = {
    id: review.id,
    serviceId: review.serviceId,
    authorName: body.authorName,
    rating: body.rating,
    comment: body.comment,
  };
  const index = reviews.findIndex((item) => item.id === review.id);
  reviews.splice(index, 1, newReview);
  return res.status(200).json(newReview);
});

app.patch("/api/v1/reviews/:id", (req, res) => {
  const body = req.body || {};
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: "Request body must not be empty" });
  }

  const review = reviews.find((item) => item.id === req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const tmpReview = {
    authorName: body.authorName,
    rating: body.rating,
    comment: body.comment,
  };
  if (tmpReview.authorName === undefined &&
      tmpReview.rating === undefined &&
      tmpReview.comment === undefined) {
    return res.status(400).json({
      message: "At least one of authorName, rating, comment is required",
    });
  }
  // Chuẩn bị bản cập nhật, chỉ lưu sau khi tất cả field đều hợp lệ.
  const updatedReview = { ...review };

  if (tmpReview.authorName !== undefined) {
    if (tmpReview.authorName === null || tmpReview.authorName === "") {
      return res.status(400).json({ message: "authorName must not be null or empty" });
    }
    if (typeof tmpReview.authorName !== "string") {
      return res.status(400).json({ message: "authorName must be a string" });
    }
    if (tmpReview.authorName.trim() === "") {
      return res.status(400).json({ message: "authorName must not be blank" });
    }
    updatedReview.authorName = tmpReview.authorName;
  }

  if (tmpReview.rating !== undefined) {
    if (tmpReview.rating === null || tmpReview.rating === "") {
      return res.status(400).json({ message: "rating must not be null or empty" });
    }
    if (typeof tmpReview.rating !== "number") {
      return res.status(400).json({ message: "rating must be a number" });
    }
    if (!Number.isFinite(tmpReview.rating) || tmpReview.rating < 1 || tmpReview.rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }
    updatedReview.rating = tmpReview.rating;
  }

  if (tmpReview.comment !== undefined) {
    if (typeof tmpReview.comment !== "string") {
      return res.status(400).json({ message: "comment must be a string" });
    }
    updatedReview.comment = tmpReview.comment;
  }

  review.authorName = updatedReview.authorName;
  review.rating = updatedReview.rating;
  review.comment = updatedReview.comment;
  return res.status(200).json(review);
});

app.delete("/api/v1/reviews/:id", (req, res) => {
  const index = reviews.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Review not found" });
  }
  reviews.splice(index, 1);
  return res.status(204).send();
});

if (require.main === module) {
  const port = 3000;
  app.listen(port, () => {
    console.log("Booking demo listening on http://localhost:" + port);
  });
}

module.exports = app;
