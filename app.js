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

// Global function for scrolling to booking section
function scrollToBooking() {
  const bookingSection = document.getElementById("booking");
  if (bookingSection) {
    bookingSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  // Send email notifications (non-blocking)
  sendBookingNotifications(enhancedBooking);

  console.log("📝 Booking saved to localStorage:", enhancedBooking);
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
  // Don't await email sending - let it happen in background
  // This prevents email errors from blocking the booking success
  setTimeout(async () => {
    try {
      console.log("📧 Attempting to send email notifications...");
      
      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        console.warn("EmailJS not available - emails will not be sent");
        return;
      }

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

      console.log("✅ Email notifications sent successfully");
    } catch (error) {
      console.warn("⚠️ Failed to send email notifications:", error);
      // Email failure doesn't affect booking success
    }
  }, 100); // Small delay to ensure booking is saved first
}

// Enhanced loading and success functions
function showLoadingSpinner(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `;
    button.disabled = true;
  }
}

function resetButton(buttonId, originalText) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

// Safe notification removal function
function safeRemoveNotification(notificationElement) {
  if (!notificationElement) return;

  // Mark as being removed to prevent double removal
  if (notificationElement.dataset.removing === "true") return;
  notificationElement.dataset.removing = "true";

  try {
    notificationElement.classList.add("translate-x-full");
    setTimeout(() => {
      try {
        if (
          notificationElement &&
          notificationElement.parentNode &&
          notificationElement.dataset.removing === "true"
        ) {
          notificationElement.parentNode.removeChild(notificationElement);
        }
      } catch (error) {
        // Silently handle - notification already removed
      }
    }, 300);
  } catch (error) {
    // Silently handle any errors
  }
}

// Modern notification system
function showNotification(message, type = "success", duration = 4000) {
  // Create or get notification container
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className = "fixed top-4 right-4 z-50 space-y-2";
    document.body.appendChild(container);
  }

  const notificationDiv = document.createElement("div");

  // Define notification styles based on type
  const styles = {
    success: {
      bg: "bg-green-500",
      icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>`,
    },
    error: {
      bg: "bg-red-500",
      icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>`,
    },
    warning: {
      bg: "bg-yellow-500",
      icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>`,
    },
    info: {
      bg: "bg-blue-500",
      icon: `<svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
      </svg>`,
    },
  };

  const style = styles[type] || styles.success;

  notificationDiv.className = `${style.bg} text-white px-6 py-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 max-w-md`;
  notificationDiv.innerHTML = `
    <div class="flex items-start">
      ${style.icon}
      <div class="flex-1">
        <div class="text-sm font-medium leading-relaxed">${message}</div>
      </div>
      <button class="ml-4 text-white hover:text-gray-200 transition-colors" onclick="safeRemoveNotification(this.parentElement.parentElement)">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;

  container.appendChild(notificationDiv);

  // Animate in
  setTimeout(() => {
    notificationDiv.classList.remove("translate-x-full");
    notificationDiv.classList.add("translate-x-0");
  }, 100);

  // Auto-remove after duration
  setTimeout(() => {
    safeRemoveNotification(notificationDiv);
  }, duration);
}

// Convenience functions for different notification types
function showSuccessMessage(message, duration = 4000) {
  showNotification(message, "success", duration);
}

function showErrorMessage(message, duration = 5000) {
  showNotification(message, "error", duration);
}

function showWarningMessage(message, duration = 4000) {
  showNotification(message, "warning", duration);
}

function showInfoMessage(message, duration = 4000) {
  showNotification(message, "info", duration);
}

// Demo function to test all notification types (for development)
function testNotifications() {
  showSuccessMessage("✅ Success! Your booking has been confirmed.");
  setTimeout(
    () => showErrorMessage("❌ Error! Please check your form details."),
    1000
  );
  setTimeout(
    () => showWarningMessage("⚠️ Warning! Please select your dates."),
    2000
  );
  setTimeout(
    () => showInfoMessage("ℹ️ Info! Your session will expire in 10 minutes."),
    3000
  );
}

// Test function for booking success notification
function testBookingSuccess() {
  console.log("🧪 Testing booking success notification...");
  showSuccessMessage(
    "🎉 Booking confirmed! Confirmation code: TEST123. Please check your email for booking details and confirmation.",
    6000
  );
  
  setTimeout(() => {
    console.log("🧪 Testing email reminder notification...");
    showInfoMessage(
      "📧 Don't forget to check your email (including spam folder) for your booking confirmation and check-in instructions.",
      5000
    );
  }, 3000);
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
      showErrorMessage(
        "Please fill in all required fields to complete your booking."
      );
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
    showSuccessMessage(
      "🎉 Booking successful! Please check your email for confirmation details and check-in instructions.",
      6000
    );
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
      showErrorMessage(
        "Please fill in all required fields and accept the terms and conditions."
      );
      return;
    }

    if (!selectedCheckIn || !selectedCheckOut) {
      showWarningMessage(
        "Please select your check-in and check-out dates to continue."
      );
      return;
    }

    // Show loading spinner
    const submitButton = bookingModalForm.querySelector(
      'button[type="submit"]'
    );
    const originalText = submitButton.innerHTML;
    showLoadingSpinner(submitButton.id || "modal-submit-btn");

    try {
      console.log("🚀 Starting booking process...");
      
      // Calculate total for booking
      const nights =
        selectedCheckIn && selectedCheckOut
          ? daysBetween(selectedCheckIn, selectedCheckOut)
          : 0;
      const cleaningFee = nights > 0 ? 150 : 0;
      const discount = nights >= 7 ? 0.9 : 1;
      const baseTotal = nights * PRICE_PER_NIGHT * discount;
      const total = nights > 0 ? baseTotal + cleaningFee : 0;

      console.log("💰 Calculated total:", total);

      // Save booking
      const booking = await addBooking({
        name: name,
        email: email,
        phone: phone,
        guests: guests,
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        specialRequests: specialRequests,
        total: `R${total.toFixed(2)}`,
      });

      console.log("✅ Booking saved:", booking);

      // Reset form and close modal
      bookingModalForm.reset();
      selectedCheckIn = null;
      selectedCheckOut = null;
      closeBookingModal();

      // Update main calendar
      renderCalendar();
      updateSummary();

      console.log("🎉 About to show success message...");

      // Show success message with booking details
      showSuccessMessage(
        `🎉 Booking confirmed! Confirmation code: ${booking.confirmationCode}. Please check your email for booking details and confirmation.`,
        6000
      );

      console.log("✅ Success message should be visible now");

      // Show additional email reminder after a delay
      setTimeout(() => {
        console.log("📧 Showing email reminder...");
        showInfoMessage(
          `📧 Don't forget to check your email (including spam folder) for your booking confirmation and check-in instructions.`,
          5000
        );
      }, 3000);

      // Track booking event for analytics
      if (typeof trackBookingEvent === "function") {
        trackBookingEvent("booking_completed", booking.total);
      }
    } catch (error) {
      console.error("❌ Booking error:", error);
      showErrorMessage(
        "❌ Booking failed. Please check your details and try again."
      );
    } finally {
      // Reset button
      resetButton(submitButton.id || "modal-submit-btn", originalText);
    }
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

  // Show welcome notification after page loads
  setTimeout(() => {
    showInfoMessage(
      "🏠 Welcome to JoburgStay! Book your perfect Johannesburg getaway.",
      6000
    );
  }, 2000);
};
