// Performance Monitoring and Analytics for JoburgStay

class PerformanceAnalytics {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      bookingConversion: 0,
      userInteractions: [],
      errors: [],
    };
    this.init();
  }

  init() {
    this.trackPageLoad();
    this.trackUserInteractions();
    this.trackBookingFunnel();
    this.trackErrors();
    this.addPerformanceWidget();
  }

  trackPageLoad() {
    window.addEventListener("load", () => {
      const loadTime = performance.now();
      this.metrics.pageLoadTime = Math.round(loadTime);
      
      // Performance status
      let status = "🚀 Excellent";
      let color = "green";
      if (loadTime > 3000) {
        status = "🐌 Slow";
        color = "red";
      } else if (loadTime > 2000) {
        status = "⚡ Good";
        color = "orange";
      }
      
      console.log(`%c${status} - Page loaded in ${this.metrics.pageLoadTime}ms`, `color: ${color}; font-weight: bold;`);

      // Show performance badge if load time is good
      if (loadTime < 2000) {
        this.showPerformanceBadge();
      }
      
      // Show performance summary after 3 seconds
      setTimeout(() => this.showPerformanceSummary(), 3000);
    });
  }
  
  showPerformanceSummary() {
    console.group("📊 JoburgStay Performance Summary");
    console.log(`⏱️ Load Time: ${this.metrics.pageLoadTime}ms`);
    console.log(`🖱️ User Interactions: ${this.metrics.userInteractions.length}`);
    console.log(`❌ Errors: ${this.metrics.errors.length}`);
    console.log(`📱 Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`);
    console.log(`🌐 Connection: ${navigator.connection ? navigator.connection.effectiveType : 'Unknown'}`);
    console.groupEnd();
  }

  trackUserInteractions() {
    // Track clicks on important elements
    const trackableElements = [
      "#navbarBookBtn",
      "#bookNowBtn",
      ".direction-btn",
      "#gallery img",
      ".amenity-item",
    ];

    trackableElements.forEach((selector) => {
      document.addEventListener("click", (e) => {
        if (e.target.matches(selector) || e.target.closest(selector)) {
          this.metrics.userInteractions.push({
            element: selector,
            timestamp: Date.now(),
            page: window.location.pathname,
          });
        }
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener("scroll", () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
    });

    // Send scroll data when user leaves
    window.addEventListener("beforeunload", () => {
      console.log(`📊 Max scroll depth: ${maxScroll}%`);
    });
  }

  trackBookingFunnel() {
    const funnelSteps = {
      page_view: false,
      calendar_interaction: false,
      booking_modal_open: false,
      form_started: false,
      form_completed: false,
    };

    // Page view
    funnelSteps.page_view = true;

    // Calendar interaction
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-date]")) {
        funnelSteps.calendar_interaction = true;
        console.log("📅 Calendar interaction tracked");
      }
    });

    // Modal open
    const originalOpenModal = window.openBookingModal;
    if (originalOpenModal) {
      window.openBookingModal = function () {
        funnelSteps.booking_modal_open = true;
        console.log("🔓 Booking modal opened");
        return originalOpenModal.apply(this, arguments);
      };
    }

    // Form interaction
    document.addEventListener("input", (e) => {
      if (e.target.closest("#bookingModalForm")) {
        funnelSteps.form_started = true;
        console.log("📝 Form interaction started");
      }
    });

    // Form completion
    document.addEventListener("submit", (e) => {
      if (e.target.id === "bookingModalForm") {
        funnelSteps.form_completed = true;
        console.log("✅ Booking form completed");
        this.calculateConversionRate(funnelSteps);
      }
    });
  }

  calculateConversionRate(funnelSteps) {
    const completedSteps = Object.values(funnelSteps).filter(Boolean).length;
    const conversionRate =
      (completedSteps / Object.keys(funnelSteps).length) * 100;
    console.log(`📈 Conversion rate: ${conversionRate.toFixed(1)}%`);
  }

  trackErrors() {
    window.addEventListener("error", (e) => {
      // Filter out notification removal errors (they're handled gracefully)
      if (e.message && e.message.includes("removeChild") && e.message.includes("not a child")) {
        console.debug("Notification removal error (handled gracefully):", e.message);
        return;
      }
      
      this.metrics.errors.push({
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        timestamp: Date.now(),
      });
      console.error("🚨 JavaScript error tracked:", e.message);
    });

    // Track unhandled promise rejections
    window.addEventListener("unhandledrejection", (e) => {
      this.metrics.errors.push({
        message: e.reason,
        type: "unhandled_promise",
        timestamp: Date.now(),
      });
      console.error("🚨 Unhandled promise rejection:", e.reason);
    });
  }

  showPerformanceBadge() {
    const badgeHTML = `
      <div id="performance-badge" class="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg z-40 text-sm font-medium">
        ⚡ Fast Loading
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", badgeHTML);

    // Remove after 3 seconds
    setTimeout(() => {
      const badge = document.getElementById("performance-badge");
      if (badge) badge.remove();
    }, 3000);
  }

  addPerformanceWidget() {
    // Only show in development/testing
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("netlify")
    ) {
      const widgetHTML = `
        <div id="perf-widget" class="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50" style="font-family: monospace;">
          <div>Load: <span id="load-time">${this.metrics.pageLoadTime}ms</span></div>
          <div>Interactions: <span id="interaction-count">0</span></div>
          <div>Errors: <span id="error-count">0</span></div>
        </div>
      `;

      document.body.insertAdjacentHTML("beforeend", widgetHTML);

      // Update widget periodically
      setInterval(() => {
        document.getElementById("interaction-count").textContent =
          this.metrics.userInteractions.length;
        document.getElementById("error-count").textContent =
          this.metrics.errors.length;
      }, 1000);
    }
  }

  // Method to send analytics to external service
  sendAnalytics() {
    const data = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      metrics: this.metrics,
    };

    // In production, send to your analytics service
    console.log("📊 Analytics data:", data);

    // Example: Send to Google Analytics 4
    // gtag('event', 'page_performance', {
    //   'load_time': this.metrics.pageLoadTime,
    //   'interactions': this.metrics.userInteractions.length
    // });
  }
}

// Initialize performance analytics
document.addEventListener("DOMContentLoaded", () => {
  window.performanceAnalytics = new PerformanceAnalytics();
});
