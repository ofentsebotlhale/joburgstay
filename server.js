const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

// Middleware
app.use(cors());
app.use(express.json());

// Initialize bookings file if it doesn't exist
async function initializeBookingsFile() {
  try {
    await fs.access(BOOKINGS_FILE);
  } catch (error) {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify([]));
  }
}

// Routes
app.get("/api/bookings", async (req, res) => {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, "utf8");
    const bookings = JSON.parse(data);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to read bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const bookings = JSON.parse(await fs.readFile(BOOKINGS_FILE, "utf8"));
    const newBooking = {
      ...req.body,
      id: generateBookingId(),
      timestamp: new Date().toISOString(),
      status: "pending",
      confirmationCode: generateConfirmationCode(),
    };

    bookings.push(newBooking);
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    res.json(newBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to save booking" });
  }
});

app.get("/api/availability", async (req, res) => {
  try {
    const bookings = JSON.parse(await fs.readFile(BOOKINGS_FILE, "utf8"));
    const blockedDates = new Set();

    for (const booking of bookings) {
      if (booking.status === "confirmed") {
        let d = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        while (d < end) {
          blockedDates.add(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
      }
    }

    res.json({ blockedDates: Array.from(blockedDates) });
  } catch (error) {
    res.status(500).json({ error: "Failed to get availability" });
  }
});

// Utility functions
function generateBookingId() {
  return (
    "BK" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  );
}

function generateConfirmationCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Start server
async function startServer() {
  await initializeBookingsFile();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
