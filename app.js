const PRICE_PER_NIGHT = 500;

// Booking Modal functionality
const bookingModal = document.getElementById("bookingModal");
const closeBookingModalBtn = document.getElementById("closeBookingModal");
const bookingModalForm = document.getElementById("bookingModalForm");
const modalCalendarContainer = document.getElementById(
  "modalCalendarContainer"
);

// Global function for Book Now button - now opens modal
function openBookingModal() {
  console.log("Opening booking modal...");
  if (bookingModal) {
    bookingModal.style.display = "flex";
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
    // Render calendar in modal
    renderModalCalendar();
    updateModalSummary();
  }
}

function closeBookingModal() {
  console.log("Closing booking modal...");
  if (bookingModal) {
    bookingModal.style.display = "none";
    // Restore body scrolling when modal is closed
    document.body.style.overflow = "auto";
  }
}

// Render calendar for modal
async function renderModalCalendar() {
  if (!modalCalendarContainer) return;

  modalCalendarContainer.innerHTML = "";
  const today = new Date();
  const blocked = await getBlockedDates();

  // Show current month
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const cal = document.createElement("div");
  cal.className = "inline-block bg-white border rounded-lg p-2 md:p-4 shadow";
  cal.style.width = "280px";
  cal.style.maxWidth = "100%";

  cal.innerHTML = `
    <div class="mb-3 text-center font-semibold text-gray-800">
      ${month.toLocaleString("default", { month: "long", year: "numeric" })}
    </div>
    <div class="grid grid-cols-7 text-xs text-gray-500 mb-2">
      ${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
        .map((d) => `<div class="text-center">${d}</div>`)
        .join("")}
    </div>
  `;

  // Days grid
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const dayCells = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    dayCells.push("<div></div>");
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    const ymd = date.toISOString().split("T")[0];
    let classes = "p-2 rounded cursor-pointer text-center text-sm";
    let disabled = false;

    if (blocked.has(ymd)) {
      classes += " bg-gray-200 text-gray-400 cursor-not-allowed";
      disabled = true;
    } else if (ymd < today.toISOString().split("T")[0]) {
      classes += " text-gray-300 cursor-not-allowed";
      disabled = true;
    } else {
      classes += " hover:bg-gray-100";
    }

    if (selectedCheckIn === ymd) classes += " bg-gray-600 text-white font-bold";
    if (selectedCheckOut === ymd)
      classes += " bg-gray-500 text-white font-bold";
    if (
      !disabled &&
      selectedCheckIn &&
      !selectedCheckOut &&
      ymd > selectedCheckIn
    ) {
      classes += " bg-gray-50";
    }

    dayCells.push(
      `<button class="${classes}" style="width:2.5em" data-date="${ymd}" ${
        disabled ? "disabled" : ""
      }>${d}</button>`
    );
  }

  cal.innerHTML += `<div class="grid grid-cols-7 gap-1">${dayCells.join(
    ""
  )}</div>`;

  // Add click handlers
  cal.querySelectorAll("button[data-date]").forEach((btn) => {
    btn.onclick = () => {
      const date = btn.getAttribute("data-date");
      if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
        selectedCheckIn = date;
        selectedCheckOut = null;
      } else if (
        selectedCheckIn &&
        !selectedCheckOut &&
        date > selectedCheckIn
      ) {
        selectedCheckOut = date;
      }
      updateModalSummary();
      renderModalCalendar(); // Re-render to update colors
    };
  });

  modalCalendarContainer.appendChild(cal);
}

// Update modal summary
function updateModalSummary() {
  const nights =
    selectedCheckIn && selectedCheckOut
      ? daysBetween(selectedCheckIn, selectedCheckOut)
      : 0;
  let cleaningFee = nights > 0 ? 150 : 0;
  let discount = nights >= 7 ? 0.9 : 1;
  let baseTotal = nights * PRICE_PER_NIGHT * discount;
  let total = nights > 0 ? baseTotal + cleaningFee : 0;

  // Update modal elements
  const modalCheckInDate = document.getElementById("modalCheckInDate");
  const modalCheckOutDate = document.getElementById("modalCheckOutDate");
  const modalNightsCount = document.getElementById("modalNightsCount");
  const modalTotalPrice = document.getElementById("modalTotalPrice");
  const modalSubmitPrice = document.getElementById("modalSubmitPrice");

  if (modalCheckInDate) modalCheckInDate.textContent = selectedCheckIn || "-";
  if (modalCheckOutDate)
    modalCheckOutDate.textContent = selectedCheckOut || "-";
  if (modalNightsCount) modalNightsCount.textContent = nights;
  if (modalTotalPrice)
    modalTotalPrice.textContent =
      nights > 0
        ? `R${total.toFixed(2)}${discount < 1 ? " (10% discount!)" : ""}`
        : "R0";
  if (modalSubmitPrice)
    modalSubmitPrice.textContent = nights > 0 ? `R${total.toFixed(2)}` : "R0";
}

// Enhanced booking system with email notifications (Netlify optimized)
const API_BASE_URL = "https://joburgstay.netlify.app/api";

async function getBookings() {
  // For static hosting (Netlify), use localStorage only
  return JSON.parse(localStorage.getItem("bookings") || "[]");
}

async function addBooking(booking) {
  // For static hosting (Netlify), use localStorage only
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const enhancedBooking = {
    ...booking,
    id: generateBookingId(),
    timestamp: new Date().toISOString(),
    status: "pending",
    confirmationCode: generateConfirmationCode(),
  };

  bookings.push(enhancedBooking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // Send email notifications
  sendBookingNotifications(enhancedBooking);

  return enhancedBooking;
}

function generateBookingId() {
  return (
    "BK" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  );
}

function generateConfirmationCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function sendBookingNotifications(booking) {
  try {
    // Send notification to property owner
    await emailjs.send("service_2mja4zm", "owner_alert", {
      booking_id: booking.id,
      guest_name: booking.name,
      guest_email: booking.email,
      guest_phone: booking.phone,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      total: booking.total,
      special_requests: booking.specialRequests || "None",
      confirmation_code: booking.confirmationCode,
    });

    // Send confirmation to guest
    await emailjs.send("service_2mja4zm", "guest_confirm", {
      guest_name: booking.name,
      guest_email: booking.email,
      confirmation_code: booking.confirmationCode,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total: booking.total,
      property_name: "Modern Johannesburg Apartment",
    });

    console.log("Email notifications sent successfully");
  } catch (error) {
    console.error("Failed to send email notifications:", error);
    // Still show success to user, but log the error
  }
}
// Returns a set of all booked-in dates (YYYY-MM-DD)
async function getBlockedDates() {
  // For static hosting (Netlify), use localStorage only
  const all = await getBookings();
  const set = new Set();
  for (const b of all) {
    if (b.status === "confirmed") {
      let d = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      while (d < end) {
        set.add(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }
    }
  }
  return set;
}

let selectedCheckIn = null;
let selectedCheckOut = null;

const calendarContainer = document.getElementById("calendarContainer");
const nightsCount = document.getElementById("nightsCount");
const totalPrice = document.getElementById("totalPrice");
const checkInDisplay = document.getElementById("checkInDisplay");
const checkOutDisplay = document.getElementById("checkOutDisplay");
const bookNowBtn = document.getElementById("bookNowBtn");

function daysBetween(a, b) {
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
}

function updateSummary() {
  const nights =
    selectedCheckIn && selectedCheckOut
      ? daysBetween(selectedCheckIn, selectedCheckOut)
      : 0;
  let cleaningFee = nights > 0 ? 150 : 0;
  let discount = nights >= 7 ? 0.9 : 1; // 10% off for 7+ nights
  let baseTotal = nights * PRICE_PER_NIGHT * discount;
  let total = nights > 0 ? baseTotal + cleaningFee : 0;

  nightsCount.textContent = nights;
  checkInDisplay.textContent = selectedCheckIn || "-";
  checkOutDisplay.textContent = selectedCheckOut || "-";
  totalPrice.textContent =
    nights > 0
      ? `R${total.toFixed(2)}${discount < 1 ? " (10% discount!)" : ""}`
      : "R0";
  bookNowBtn.disabled = !(selectedCheckIn && selectedCheckOut && nights > 0);

  // Update modal summary
  const modalCheckIn = document.getElementById("modalCheckIn");
  const modalCheckOut = document.getElementById("modalCheckOut");
  const modalNights = document.getElementById("modalNights");
  const modalTotal = document.getElementById("modalTotal");

  if (modalCheckIn) modalCheckIn.textContent = selectedCheckIn || "-";
  if (modalCheckOut) modalCheckOut.textContent = selectedCheckOut || "-";
  if (modalNights) modalNights.textContent = nights;
  if (modalTotal)
    modalTotal.textContent =
      nights > 0
        ? `R${total.toFixed(2)}${discount < 1 ? " (10% discount!)" : ""}`
        : "R0";
}

async function renderCalendar(monthOffset = 0) {
  // Show 2 months side by side
  calendarContainer.innerHTML = "";
  for (let m = 0; m < 2; m++) {
    calendarContainer.appendChild(await renderMonthCalendar(monthOffset + m));
  }
}

async function renderMonthCalendar(offset = 0) {
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const blocked = await getBlockedDates();

  // Header
  const cal = document.createElement("div");
  cal.className =
    "inline-block align-top bg-white border rounded-lg p-2 md:p-4 shadow m-1";
  cal.style.width = "280px";
  cal.style.maxWidth = "100%";
  cal.innerHTML = `<div class="mb-2 text-center font-semibold">
    ${month.toLocaleString("default", { month: "long", year: "numeric" })}
  </div>
  <div class="grid grid-cols-7 text-xs text-gray-400 mb-1">
    ${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
      .map((d) => `<div>${d}</div>`)
      .join("")}
  </div>`;

  // Days grid
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const dayCells = [];
  for (let i = 0; i < firstDay.getDay(); i++) dayCells.push("<div></div>");
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    const ymd = date.toISOString().split("T")[0];
    let classes = "p-2 rounded cursor-pointer text-center";
    let disabled = false;
    if (blocked.has(ymd)) {
      classes += " bg-gray-300 text-gray-400 cursor-not-allowed";
      disabled = true;
    } else if (ymd < today.toISOString().split("T")[0]) {
      classes += " text-gray-300 cursor-not-allowed";
      disabled = true;
    } else {
      classes += " hover:bg-gray-100";
    }
    if (selectedCheckIn === ymd) classes += " bg-gray-600 text-white font-bold";
    if (selectedCheckOut === ymd)
      classes += " bg-gray-500 text-white font-bold";
    if (
      !disabled &&
      selectedCheckIn &&
      !selectedCheckOut &&
      ymd > selectedCheckIn
    )
      classes += " bg-gray-50";
    dayCells.push(
      `<button class="${classes}" style="width:2.15em" data-date="${ymd}" ${
        disabled ? "disabled" : ""
      }>${d}</button>`
    );
  }
  cal.innerHTML += `<div class="grid grid-cols-7 gap-1">${dayCells.join(
    ""
  )}</div>`;
  // Click handler for date selection
  cal.querySelectorAll("button[data-date]").forEach((btn) => {
    btn.onclick = () => {
      const date = btn.getAttribute("data-date");
      if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
        selectedCheckIn = date;
        selectedCheckOut = null;
      } else if (
        selectedCheckIn &&
        !selectedCheckOut &&
        date > selectedCheckIn
      ) {
        selectedCheckOut = date;
      }
      updateSummary();
      renderCalendar();
    };
  });
  return cal;
}

// Modal functionality
const modalBackdrop = document.getElementById("modalBackdrop");
const bookingForm = document.getElementById("bookingForm");
const closeModalBtn = document.getElementById("closeModalBtn");

function openModal() {
  if (modalBackdrop) {
    modalBackdrop.style.display = "flex";
    modalBackdrop.classList.add("items-center", "justify-center");
    updateSummary(); // Update modal with current selection
  }
}

function closeModal() {
  if (modalBackdrop) {
    modalBackdrop.style.display = "none";
    modalBackdrop.classList.remove("items-center", "justify-center");
  }
}

if (closeModalBtn) closeModalBtn.onclick = closeModal;

// Close modal when clicking backdrop
if (modalBackdrop) {
  modalBackdrop.onclick = function (e) {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  };
}

if (bookingForm) {
  bookingForm.onsubmit = async function (e) {
    e.preventDefault();

    // Validate form
    const name = document.getElementById("guestName").value.trim();
    const email = document.getElementById("guestEmail").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const guests = document.getElementById("guestCount").value;

    if (!name || !email || !phone || !guests) {
      alert("Please fill in all fields.");
      return;
    }

    // Save booking
    await addBooking({
      name: name,
      email: email,
      phone: phone,
      guests: guests,
      checkIn: selectedCheckIn,
      checkOut: selectedCheckOut,
    });

    // Reset selections
    selectedCheckIn = null;
    selectedCheckOut = null;
    closeModal();
    renderCalendar();
    updateSummary();
    bookingForm.reset();

    // Show success message
    alert("Booking successful! We'll contact you soon to confirm your stay.");
  };
}
// Navbar Book Now Button functionality
const navbarBookBtn = document.getElementById("navbarBookBtn");

if (navbarBookBtn) {
  navbarBookBtn.onclick = function () {
    console.log("Book Now button clicked!");
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      console.log("Scrolling to booking section...");
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.error("Booking section not found");
    }
  };
}

// Event handlers for modal
if (closeBookingModalBtn) {
  closeBookingModalBtn.onclick = closeBookingModal;
}

// Close modal when clicking backdrop
if (bookingModal) {
  bookingModal.onclick = function (e) {
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  };
}

// Modal form submission
if (bookingModalForm) {
  bookingModalForm.onsubmit = async function (e) {
    e.preventDefault();

    // Validate form
    const name = document.getElementById("modalGuestName").value.trim();
    const email = document.getElementById("modalGuestEmail").value.trim();
    const phone = document.getElementById("modalGuestPhone").value.trim();
    const guests = document.getElementById("modalGuestCount").value;
    const specialRequests = document
      .getElementById("modalSpecialRequests")
      .value.trim();
    const terms = document.getElementById("modalTerms").checked;

    if (!name || !email || !phone || !guests || !terms) {
      alert("Please fill in all required fields and accept the terms.");
      return;
    }

    if (!selectedCheckIn || !selectedCheckOut) {
      alert("Please select your check-in and check-out dates.");
      return;
    }

    // Save booking
    await addBooking({
      name: name,
      email: email,
      phone: phone,
      guests: guests,
      checkIn: selectedCheckIn,
      checkOut: selectedCheckOut,
      specialRequests: specialRequests,
      total: document.getElementById("modalSubmitPrice").textContent,
    });

    // Reset form and close modal
    bookingModalForm.reset();
    selectedCheckIn = null;
    selectedCheckOut = null;
    closeBookingModal();

    // Update main calendar
    renderCalendar();
    updateSummary();

    // Show success message
    alert("Booking successful! We'll contact you soon to confirm your stay.");
  };
}

// Initialization
window.onload = async () => {
  selectedCheckIn = null;
  selectedCheckOut = null;
  await renderCalendar();
  updateSummary();

  // Set up navbar book button to open modal
  const navbarBookBtn = document.getElementById("navbarBookBtn");
  if (navbarBookBtn) {
    console.log("Found navbar Book Now button, connecting to modal...");
    navbarBookBtn.onclick = openBookingModal;
  } else {
    console.error("Navbar Book Now button not found!");
  }

  // Set up booking section book button to open modal
  const bookNowBtn = document.getElementById("bookNowBtn");
  if (bookNowBtn) {
    console.log(
      "Found booking section Book Now button, connecting to modal..."
    );
    bookNowBtn.onclick = openBookingModal;
  } else {
    console.error("Booking section Book Now button not found!");
  }
};
