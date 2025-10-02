// Real-Time Features for JoburgStay

class RealTimeFeatures {
  constructor() {
    this.init();
  }

  init() {
    this.addLiveBookingCounter();
    this.addWeatherWidget();
    this.addRecentBookingNotifications();
    this.addAvailabilityIndicator();
  }

  // Show live booking activity
  addLiveBookingCounter() {
    const counterHTML = `
      <div id="live-counter" class="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg z-40 animate-pulse">
        <div class="flex items-center">
          <div class="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
          <span class="text-sm font-medium">3 people viewing</span>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", counterHTML);

    // Update counter periodically
    setInterval(() => {
      const counter = document.querySelector("#live-counter span");
      if (counter) {
        const count = Math.floor(Math.random() * 8) + 1;
        counter.textContent = `${count} people viewing`;
      }
    }, 15000);
  }

  // Add weather widget for Johannesburg
  addWeatherWidget() {
    const weatherHTML = `
      <div id="weather-widget" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 class="font-bold text-blue-800 mb-2">🌤️ Current Weather in Johannesburg</h4>
        <div id="weather-content" class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-blue-900">22°C</div>
            <div class="text-blue-700">Sunny</div>
          </div>
          <div class="text-right text-sm text-blue-600">
            <div>Perfect weather for exploring!</div>
            <div>UV Index: 6 (High)</div>
          </div>
        </div>
      </div>
    `;

    // Add to booking section
    const bookingSection = document.querySelector(
      "#booking .flex-1:last-child"
    );
    if (bookingSection) {
      bookingSection.insertAdjacentHTML("afterbegin", weatherHTML);
    }

    // Simulate weather updates
    this.updateWeather();
    setInterval(() => this.updateWeather(), 300000); // Update every 5 minutes
  }

  updateWeather() {
    const temps = [18, 19, 20, 21, 22, 23, 24, 25];
    const conditions = ["Sunny", "Partly Cloudy", "Clear", "Warm"];

    const temp = temps[Math.floor(Math.random() * temps.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    const weatherContent = document.getElementById("weather-content");
    if (weatherContent) {
      weatherContent.innerHTML = `
        <div>
          <div class="text-2xl font-bold text-blue-900">${temp}°C</div>
          <div class="text-blue-700">${condition}</div>
        </div>
        <div class="text-right text-sm text-blue-600">
          <div>Perfect weather for exploring!</div>
          <div>UV Index: ${Math.floor(Math.random() * 3) + 5} (High)</div>
        </div>
      `;
    }
  }

  // Show recent booking notifications
  addRecentBookingNotifications() {
    const notifications = [
      "Sarah from Cape Town just booked for next weekend!",
      "Mike from Durban booked a 3-night stay!",
      "Lisa from Pretoria just made a reservation!",
      "John from Port Elizabeth booked for business trip!",
      "Emma from Bloemfontein just confirmed booking!",
    ];

    let notificationIndex = 0;

    const showNotification = () => {
      const notification = notifications[notificationIndex];
      const notificationHTML = `
        <div id="booking-notification" class="fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-500 max-w-xs">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
            <span class="text-sm">${notification}</span>
          </div>
        </div>
      `;

      // Remove existing notification
      const existing = document.getElementById("booking-notification");
      if (existing) existing.remove();

      document.body.insertAdjacentHTML("beforeend", notificationHTML);

      const notificationEl = document.getElementById("booking-notification");

      // Animate in
      setTimeout(() => {
        notificationEl.classList.remove("translate-x-full");
      }, 100);

      // Animate out after 4 seconds
      setTimeout(() => {
        notificationEl.classList.add("translate-x-full");
        setTimeout(() => {
          if (notificationEl.parentNode) {
            notificationEl.remove();
          }
        }, 500);
      }, 4000);

      notificationIndex = (notificationIndex + 1) % notifications.length;
    };

    // Show first notification after 3 seconds, then every 20 seconds
    setTimeout(showNotification, 3000);
    setInterval(showNotification, 20000);
  }

  // Add availability indicator
  addAvailabilityIndicator() {
    const availabilityHTML = `
      <div id="availability-indicator" class="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg mb-4 text-center">
        <div class="flex items-center justify-center">
          <div class="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
          <span class="font-medium">✅ Available for your dates!</span>
        </div>
        <div class="text-sm mt-1 opacity-90">Book now to secure your stay</div>
      </div>
    `;

    // Add to booking widget
    const bookingWidget = document.querySelector("#booking .bg-white\\/90");
    if (bookingWidget) {
      const title = bookingWidget.querySelector("h2");
      if (title) {
        title.insertAdjacentHTML("afterend", availabilityHTML);
      }
    }
  }
}

// Initialize real-time features
document.addEventListener("DOMContentLoaded", () => {
  new RealTimeFeatures();
});
