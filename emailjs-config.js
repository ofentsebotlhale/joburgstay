// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

const EMAILJS_CONFIG = {
  // Your EmailJS Public Key (from your EmailJS account)
  PUBLIC_KEY: "33HWU_f44zZmuXLVu",

  // Your EmailJS Service ID (from your email service)
  SERVICE_ID: "service_2mja4zm",

  // Your Email Templates
  TEMPLATES: {
    OWNER_NOTIFICATION: "template_owner_notification",
    GUEST_CONFIRMATION: "template_guest_confirmation",
  },

  // Email addresses
  EMAILS: {
    OWNER_EMAIL: "your-email@gmail.com", // Your email address
    PROPERTY_NAME: "Modern Johannesburg Apartment",
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = EMAILJS_CONFIG;
}
