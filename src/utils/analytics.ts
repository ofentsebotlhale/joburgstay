// Google Analytics 4 Integration
export class GoogleAnalytics {
  private static gtag: any = null;
  private static isInitialized = false;

  // Initialize Google Analytics
  static init(measurementId: string): void {
    if (this.isInitialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    this.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
    this.gtag('js', new Date());
    this.gtag('config', measurementId, {
      page_title: 'Blue Haven on 13th Emperor',
      page_location: window.location.href,
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized');
  }

  // Track page views
  static trackPageView(pagePath: string, pageTitle: string): void {
    if (!this.gtag) return;

    this.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  // Track booking events
  static trackBookingEvent(action: string, category: string = 'Booking', label?: string, value?: number): void {
    if (!this.gtag) return;

    this.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Track booking started
  static trackBookingStarted(): void {
    this.trackBookingEvent('booking_started', 'Booking', 'Booking Modal Opened');
  }

  // Track booking completed
  static trackBookingCompleted(bookingValue: number, currency: string = 'ZAR'): void {
    if (!this.gtag) return;

    this.gtag('event', 'purchase', {
      transaction_id: `BH${Date.now()}`,
      value: bookingValue,
      currency: currency,
      event_category: 'Booking',
      event_label: 'Booking Completed',
    });
  }

  // Track payment events
  static trackPaymentEvent(method: string, amount: number): void {
    this.trackBookingEvent('payment_initiated', 'Payment', method, amount);
  }

  // Track email reminder events
  static trackEmailReminder(type: 'checkin' | 'checkout'): void {
    this.trackBookingEvent('email_reminder_sent', 'Communication', type);
  }

  // Track contact form submissions
  static trackContactForm(): void {
    this.trackBookingEvent('contact_form_submitted', 'Contact');
  }

  // Track amenity views
  static trackAmenityView(amenity: string): void {
    this.trackBookingEvent('amenity_viewed', 'Amenities', amenity);
  }

  // Track gallery views
  static trackGalleryView(): void {
    this.trackBookingEvent('gallery_viewed', 'Content');
  }

  // Track social media clicks
  static trackSocialClick(platform: string): void {
    this.trackBookingEvent('social_click', 'Social', platform);
  }

  // Track search queries (if implemented)
  static trackSearch(query: string): void {
    this.trackBookingEvent('search', 'Search', query);
  }

  // Track user engagement
  static trackEngagement(action: string, element: string): void {
    this.trackBookingEvent(action, 'Engagement', element);
  }
}

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: any;
  }
}
