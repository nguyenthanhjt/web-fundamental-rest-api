const express = require("express");

const app = express();
app.use(express.json());

const services = [
  { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
  { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
];
const reviews = [
  {
    id: "rev_001",
    serviceId: "svc_001",
    authorName: "Anh",
    rating: 5,
    comment: "Good service"
  },
  {
    id: "rev_002",
    serviceId: "svc_001",
    authorName: "Minh",
    rating: 4,
    comment: "Very good"
  },
  {
    id: "rev_003",
    serviceId: "svc_002",
    authorName: "Nam",
    rating: 3,
    comment: "Average"
  }
];
const bookings = [];
let nextBookingNumber = 1;
let nextReviewNumber = reviews.length + 1;

const writableFields = ["serviceId", "date", "timeSlot", "customerName"];

function findService(id) {
  return services.find((item) => item.id === id);
}

function findBooking(id) {
  return bookings.find((item) => item.id === id);
}
function findReview(id) {
  return reviews.find((item) => item.id === id);
}

function isValidRating(value) {
  return typeof value === "number" && value >= 1 && value <= 5;
}

function validateReview(body, partial) {
  const has = (field) => body[field] !== undefined;

  if (!partial || has("authorName")) {
    if (typeof body.authorName !== "string" || body.authorName.trim() === "") {
      return "authorName is required";
    }
  }
  if (!partial || has("rating")) {
    if (!isValidRating(body.rating)) {
      return "rating must be a number from 1 to 5";
    }
  }
  if (!partial || has("comment")) {
    if (typeof body.comment !== "string") {
      return "comment must be a string";
    }
  }
  return undefined;
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
// HOMEWORK: reviews
app.get("/api/v1/services/:serviceId/reviews", (req, res) => {
  if (!findService(req.params.serviceId)) {
    return res.status(404).json({ message: "Service not found" });
  }
  const list = reviews.filter((item) => item.serviceId === req.params.serviceId);
  return res.status(200).json(list);
});

app.post("/api/v1/services/:serviceId/reviews", (req, res) => {
  if (!findService(req.params.serviceId)) {
    return res.status(404).json({ message: "Service not found" });
  }
  const body = req.body || {};
  const data = { ...body, comment: body.comment === undefined ? "" : body.comment };
  const error = validateReview(data, false);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const newReview = {
  id: "rev_" + String(nextReviewNumber).padStart(3, "0"),
  serviceId: req.params.serviceId,
  authorName: data.authorName.trim(),
  rating: data.rating,
  comment: data.comment,
};
  nextReviewNumber += 1;
  reviews.push(newReview);
  return res.status(201).json(newReview);
});

app.get("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  return res.status(200).json(review);
});

app.put("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  const body = req.body || {};
  const error = validateReview(body, false); 
  if (error) {
    return res.status(400).json({ message: error });
  }

  review.authorName = body.authorName.trim();
  review.rating = body.rating;
  review.comment = body.comment;
  return res.status(200).json(review);
});

app.patch("/api/v1/reviews/:id", (req, res) => {
  const review = findReview(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  const body = req.body || {};
  const fields = ["authorName", "rating", "comment"].filter((f) => body[f] !== undefined);
  if (fields.length === 0) {
    return res.status(400).json({ message: "At least one of authorName, rating, comment is required" });
  }
  const error = validateReview(body, true);
  if (error) {
    return res.status(400).json({ message: error });
  }

  fields.forEach((field) => {
    review[field] = field === "authorName" ? body[field].trim() : body[field];
  });
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
const port = 3000;
app.listen(port, () => {
  console.log("Booking demo listening on http://localhost:" + port);
});
