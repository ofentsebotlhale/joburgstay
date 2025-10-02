// Blue Haven on 13th Emperor - Booking System
const PRICE_PER_NIGHT = 500;
const CLEANING_FEE = 150;
const DISCOUNT_THRESHOLD = 7; // nights for discount
const DISCOUNT_PERCENTAGE = 0.1; // 10%

// DOM Elements
let bookingModal, closeBookingModalBtn, bookingModalForm, modalCalendarContainer;
let calendarContainer, checkInDisplay, checkOutDisplay, nightsCount, totalPrice;
let modalCheckInDate, modalCheckOutDate, modalNightsCount, modalTotalPrice, modalSubmitPrice;

// Initialize DOM elements when page loads
function initializeElements() {
  bookingModal = document.getElementById("bookingModal");
  closeBookingModalBtn = document.getElementById("closeBookingModal");
  bookingModalForm = document.getElementById("bookingModalForm");
  modalCalendarContainer = document.getElementById("modalCalendarContainer");
  
  calendarContainer = document.getElementById("calendarContainer");
  checkInDisplay = document.getElementById("checkInDisplay");
  checkOutDisplay = document.getElementById("checkOutDisplay");
  nightsCount = document.getElementById("nightsCount");
  totalPrice = document.getElementById("totalPrice");
  
  modalCheckInDate = document.getElementById("modalCheckInDate");
  modalCheckOutDate = document.getElementById("modalCheckOutDate");
  modalNightsCount = document.getElementById("modalNightsCount");
  modalTotalPrice = document.getElementById("modalTotalPrice");
  modalSubmitPrice = document.getElementById("modalSubmitPrice");
}

// Booking Modal Functions
function openBookingModal() {
  console.log("Opening booking modal...");
  if (bookingModal) {
    bookingModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    renderModalCalendar();
    updateModalSummary();
  }
}

function closeBookingModal() {
  console.log("Closing booking modal...");
  if (bookingModal) {
    bookingModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function scrollToBooking() {
  const bookingSection = document.getElementById("booking");
  if (bookingSection) {
    bookingSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Calendar Functions
async function renderModalCalendar() {
  if (!modalCalendarContainer) return;

  modalCalendarContainer.innerHTML = "";
  const today = new Date();
  const blocked = await getBlockedDates();

  // Render current month and next month
  await renderMonthCalendar(0, modalCalendarContainer, blocked);
  await renderMonthCalendar(1, modalCalendarContainer, blocked);
}

async function renderMonthCalendar(offset = 0, container = calendarContainer, blockedDates = []) {
  if (!container) return;

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthName = targetDate.toLocaleString('default', { month: 'long' });

  const cal = document.createElement('div');
  cal.className = 'calendar-month bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl';
  cal.style.width = '280px';
  cal.style.maxWidth = '100%';

  cal.innerHTML = `
    <div class="text-center mb-4">
      <h3 class="text-lg font-bold text-white">${monthName} ${year}</h3>
    </div>
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Su</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Mo</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Tu</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">We</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Th</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Fr</div>
      <div class="text-center text-xs text-gray-400 font-semibold py-2">Sa</div>
    </div>
    <div class="grid grid-cols-7 gap-1" id="days-${month}-${year}"></div>
  `;

  const daysContainer = cal.querySelector(`#days-${month}-${year}`);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'h-8';
    daysContainer.appendChild(emptyDay);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('button');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = new Date(dateStr) < today;
    const isBlocked = blockedDates.includes(dateStr);

    dayElement.className = `w-8 h-8 text-sm rounded-lg transition-all duration-200 ${
      isPast || isBlocked
        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
        : 'bg-white/10 text-white hover:bg-blue-500 hover:text-white cursor-pointer'
    }`;
    dayElement.textContent = day;
    dayElement.disabled = isPast || isBlocked;

    if (!isPast && !isBlocked) {
      dayElement.addEventListener('click', () => selectDate(dateStr, dayElement));
    }

    daysContainer.appendChild(dayElement);
  }

  container.appendChild(cal);
}

// Date Selection
let selectedCheckIn = null;
let selectedCheckOut = null;

function selectDate(dateStr, element) {
  if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
    // Start new selection
    selectedCheckIn = dateStr;
    selectedCheckOut = null;
    clearDateSelection();
    element.classList.add('bg-blue-500', 'text-white');
    updateModalSummary();
  } else if (selectedCheckIn && !selectedCheckOut) {
    // Complete selection
    const checkInDate = new Date(selectedCheckIn);
    const checkOutDate = new Date(dateStr);
    
    if (checkOutDate <= checkInDate) {
      showErrorMessage('Check-out date must be after check-in date');
      return;
    }
    
    selectedCheckOut = dateStr;
    highlightDateRange();
    updateModalSummary();
  }
}

function clearDateSelection() {
  document.querySelectorAll('.calendar-month button').forEach(btn => {
    btn.classList.remove('bg-blue-500', 'bg-green-500', 'text-white');
  });
}

function highlightDateRange() {
  if (!selectedCheckIn || !selectedCheckOut) return;
  
  const checkIn = new Date(selectedCheckIn);
  const checkOut = new Date(selectedCheckOut);
  
  document.querySelectorAll('.calendar-month button').forEach(btn => {
    const day = parseInt(btn.textContent);
    if (isNaN(day)) return;
    
    const btnDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), day);
    
    if (btnDate.getTime() === checkIn.getTime()) {
      btn.classList.add('bg-blue-500', 'text-white');
    } else if (btnDate.getTime() === checkOut.getTime()) {
      btn.classList.add('bg-green-500', 'text-white');
    } else if (btnDate > checkIn && btnDate < checkOut) {
      btn.classList.add('bg-blue-300', 'text-blue-900');
    }
  });
}

// Summary Updates
function updateModalSummary() {
  if (!selectedCheckIn) {
    if (modalCheckInDate) modalCheckInDate.textContent = '-';
    if (modalCheckOutDate) modalCheckOutDate.textContent = '-';
    if (modalNightsCount) modalNightsCount.textContent = '0';
    if (modalTotalPrice) modalTotalPrice.textContent = 'R0';
    if (modalSubmitPrice) modalSubmitPrice.textContent = 'R0';
    return;
  }

  if (modalCheckInDate) modalCheckInDate.textContent = formatDate(selectedCheckIn);
  
  if (selectedCheckOut) {
    if (modalCheckOutDate) modalCheckOutDate.textContent = formatDate(selectedCheckOut);
    
    const nights = daysBetween(selectedCheckIn, selectedCheckOut);
    if (modalNightsCount) modalNightsCount.textContent = nights;
    
    const total = calculateTotal(nights);
    if (modalTotalPrice) modalTotalPrice.textContent = `R${total}`;
    if (modalSubmitPrice) modalSubmitPrice.textContent = `R${total}`;
  } else {
    if (modalCheckOutDate) modalCheckOutDate.textContent = '-';
    if (modalNightsCount) modalNightsCount.textContent = '0';
    if (modalTotalPrice) modalTotalPrice.textContent = 'R0';
    if (modalSubmitPrice) modalSubmitPrice.textContent = 'R0';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function daysBetween(a, b) {
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
}

function calculateTotal(nights) {
  let subtotal = nights * PRICE_PER_NIGHT;
  let discount = 0;
  
  if (nights >= DISCOUNT_THRESHOLD) {
    discount = subtotal * DISCOUNT_PERCENTAGE;
  }
  
  const total = subtotal + CLEANING_FEE - discount;
  return Math.round(total);
}

// Booking Functions
async function getBookings() {
  try {
    const bookings = localStorage.getItem('blueHavenBookings');
    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

async function addBooking(booking) {
  try {
    const bookings = await getBookings();
    const newBooking = {
      ...booking,
      id: generateBookingId(),
      confirmationCode: generateConfirmationCode(),
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    localStorage.setItem('blueHavenBookings', JSON.stringify(bookings));
    
    // Send email notifications
    await sendBookingNotifications(newBooking);
    
    return newBooking;
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
}

function generateBookingId() {
  return 'BH' + Date.now().toString(36).toUpperCase();
}

function generateConfirmationCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function sendBookingNotifications(booking) {
  try {
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS not available');
      return;
    }

    // Send confirmation to guest
    await emailjs.send("service_2mja4zm", "guest_confirm", {
      guest_name: booking.name,
      guest_email: booking.email,
      confirmation_code: booking.confirmationCode,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total: booking.total,
      property_name: "Blue Haven on 13th Emperor",
    });

    // Send alert to owner
    await emailjs.send("service_2mja4zm", "owner_alert", {
      guest_name: booking.name,
      guest_email: booking.email,
      guest_phone: booking.phone,
      confirmation_code: booking.confirmationCode,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      total: booking.total,
      special_requests: booking.specialRequests || 'None',
      property_name: "Blue Haven on 13th Emperor",
    });

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
}

async function getBlockedDates() {
  try {
    const bookings = await getBookings();
    const blocked = [];
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!blocked.includes(dateStr)) {
          blocked.push(dateStr);
        }
      }
    });
    
    return blocked;
  } catch (error) {
    console.error('Error getting blocked dates:', error);
    return [];
  }
}

// Notification System
function showNotification(message, type = "success", duration = 4000) {
  const container = getNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icon = getNotificationIcon(type);
  
  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">${message}</div>
    <button class="notification-close" onclick="safeRemoveNotification(this.parentElement)">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
  `;
  
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    safeRemoveNotification(notification);
  }, duration);
}

function getNotificationContainer() {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

function getNotificationIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

function safeRemoveNotification(notificationElement) {
  if (!notificationElement || notificationElement.removing) return;
  
  try {
    notificationElement.removing = true;
    notificationElement.classList.remove('show');
    
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.parentNode.removeChild(notificationElement);
      }
    }, 300);
  } catch (error) {
    console.warn('Error removing notification:', error);
  }
}

function showSuccessMessage(message, duration = 10000) {
  showNotification(message, "success", duration);
}

function showErrorMessage(message, duration = 10000) {
  showNotification(message, "error", duration);
}

function showWarningMessage(message, duration = 10000) {
  showNotification(message, "warning", duration);
}

function showInfoMessage(message, duration = 10000) {
  showNotification(message, "info", duration);
}

// Event Listeners
function setupEventListeners() {
  // Close modal button
  if (closeBookingModalBtn) {
    closeBookingModalBtn.addEventListener('click', closeBookingModal);
  }

  // Modal backdrop click
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  // Booking form submission
  if (bookingModalForm) {
    bookingModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!selectedCheckIn || !selectedCheckOut) {
        showErrorMessage('Please select both check-in and check-out dates');
        return;
      }

      const formData = new FormData(bookingModalForm);
      const nights = daysBetween(selectedCheckIn, selectedCheckOut);
      const total = calculateTotal(nights);

      const booking = {
        name: formData.get('modalGuestName') || document.getElementById('modalGuestName')?.value,
        email: formData.get('modalGuestEmail') || document.getElementById('modalGuestEmail')?.value,
        phone: formData.get('modalGuestPhone') || document.getElementById('modalGuestPhone')?.value,
        guests: formData.get('modalGuestCount') || document.getElementById('modalGuestCount')?.value,
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        nights: nights,
        total: total,
        specialRequests: formData.get('modalSpecialRequests') || document.getElementById('modalSpecialRequests')?.value
      };

      try {
        showInfoMessage('Processing your booking...', 3000);
        
        const newBooking = await addBooking(booking);
        
        // Show success message after 1 second
        setTimeout(() => {
          showSuccessMessage(
            `🎉 Booking confirmed! Your confirmation code is ${newBooking.confirmationCode}. Check your email for details.`,
            10000
          );
        }, 1000);

        // Show email reminder after 4 seconds
        setTimeout(() => {
          showInfoMessage(
            '📧 Please check your email for booking confirmation and details.',
            8000
          );
        }, 4000);

        // Close modal and reset form
        setTimeout(() => {
          closeBookingModal();
          bookingModalForm.reset();
          selectedCheckIn = null;
          selectedCheckOut = null;
          clearDateSelection();
          updateModalSummary();
        }, 2000);

      } catch (error) {
        console.error('Booking error:', error);
        showErrorMessage('Failed to process booking. Please try again or contact us directly.');
      }
    });
  }

  // Navbar Book Now button
  const navbarBookBtn = document.getElementById('navbarBookBtn');
  if (navbarBookBtn) {
    console.log('Found navbar Book Now button, connecting to modal...');
    navbarBookBtn.addEventListener('click', openBookingModal);
  }

  // Booking section Book Now button
  const bookNowBtn = document.getElementById('bookNowBtn');
  if (bookNowBtn) {
    console.log('Found booking section Book Now button, connecting to modal...');
    bookNowBtn.addEventListener('click', openBookingModal);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  
  // Show welcome message
  setTimeout(() => {
    showInfoMessage(
      "🏠 Welcome to Blue Haven on 13th Emperor! Experience luxury living in Johannesburg's most prestigious district.",
      6000
    );
  }, 2000);
});

// Make functions globally available
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.scrollToBooking = scrollToBooking;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showWarningMessage = showWarningMessage;
window.showInfoMessage = showInfoMessage;