# Email Templates Setup Guide

## 📧 Email Templates for Blue Haven on 13th Emperor

This guide will help you set up professional email templates for your React/TypeScript booking system using EmailJS.

## 📁 Template Files

### 1. **Booking Confirmation** (`booking-confirmation.html`)

- **Purpose**: Sent to guests after successful booking
- **Template ID**: `booking_confirmation`
- **Variables Used**:
  - `{{guest_name}}`
  - `{{confirmation_code}}`
  - `{{check_in_date}}`
  - `{{check_out_date}}`
  - `{{nights}}`
  - `{{guests}}`
  - `{{total_amount}}`

### 2. **Owner Notification** (`owner-notification.html`)

- **Purpose**: Sent to property owner when new booking is received
- **Template ID**: `owner_notification`
- **Variables Used**:
  - `{{booking_id}}`
  - `{{confirmation_code}}`
  - `{{guest_name}}`
  - `{{guest_email}}`
  - `{{guest_phone}}`
  - `{{check_in_date}}`
  - `{{check_out_date}}`
  - `{{nights}}`
  - `{{guests}}`
  - `{{total_amount}}`
  - `{{booking_date}}`
  - `{{special_requests}}`

### 3. **Booking Reminder** (`booking-reminder.html`)

- **Purpose**: Sent to guests 24-48 hours before check-in
- **Template ID**: `booking_reminder`
- **Variables Used**:
  - `{{guest_name}}`
  - `{{confirmation_code}}`
  - `{{check_in_date}}`
  - `{{check_out_date}}`
  - `{{guests}}`
  - `{{total_amount}}`
  - `{{days_until_checkin}}`

### 4. **Thank You** (`thank-you.html`)

- **Purpose**: Sent to guests after check-out
- **Template ID**: `thank_you`
- **Variables Used**:
  - `{{guest_name}}`
  - `{{confirmation_code}}`
  - `{{check_in_date}}`
  - `{{check_out_date}}`
  - `{{nights}}`
  - `{{guests}}`

## 🚀 EmailJS Setup Instructions

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service

1. Go to **Email Services** in your dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your **Service ID**

### Step 3: Create Email Templates

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. For each template:

#### **Booking Confirmation Template**

- **Template ID**: `booking_confirmation`
- **Template Name**: "Booking Confirmation"
- **Subject**: "Booking Confirmed - Blue Haven on 13th Emperor"
- **Content**: Copy content from `booking-confirmation.html`
- **To Email**: `{{guest_email}}`
- **From Name**: "Blue Haven on 13th Emperor"

#### **Owner Notification Template**

- **Template ID**: `owner_notification`
- **Template Name**: "Owner Notification"
- **Subject**: "New Booking Alert - Blue Haven"
- **Content**: Copy content from `owner-notification.html`
- **To Email**: `your-email@example.com` (your email)
- **From Name**: "Blue Haven Booking System"

#### **Booking Reminder Template**

- **Template ID**: `booking_reminder`
- **Template Name**: "Booking Reminder"
- **Subject**: "Your Stay is Coming Up - Blue Haven"
- **Content**: Copy content from `booking-reminder.html`
- **To Email**: `{{guest_email}}`
- **From Name**: "Blue Haven on 13th Emperor"

#### **Thank You Template**

- **Template ID**: `thank_you`
- **Template Name**: "Thank You"
- **Subject**: "Thank You for Staying at Blue Haven"
- **Content**: Copy content from `thank-you.html`
- **To Email**: `{{guest_email}}`
- **From Name**: "Blue Haven on 13th Emperor"

### Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key**
3. This will be used in your React app

## 🔧 React Integration

### Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_CONFIRMATION=booking_confirmation
VITE_EMAILJS_TEMPLATE_OWNER=owner_notification
VITE_EMAILJS_TEMPLATE_REMINDER=booking_reminder
VITE_EMAILJS_TEMPLATE_THANKYOU=thank_you
```

### Update EmailJS Utility

Update `src/utils/emailjs.ts`:

```typescript
import emailjs from "@emailjs/browser";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;

export const sendBookingConfirmation = async (bookingData: any) => {
  const templateParams = {
    guest_name: bookingData.name,
    confirmation_code: bookingData.confirmationCode,
    check_in_date: bookingData.checkIn,
    check_out_date: bookingData.checkOut,
    nights: bookingData.nights,
    guests: bookingData.guests,
    total_amount: bookingData.total,
  };

  return emailjs.send(
    SERVICE_ID,
    "booking_confirmation",
    templateParams,
    PUBLIC_KEY
  );
};

export const sendOwnerNotification = async (bookingData: any) => {
  const templateParams = {
    booking_id: bookingData.id,
    confirmation_code: bookingData.confirmationCode,
    guest_name: bookingData.name,
    guest_email: bookingData.email,
    guest_phone: bookingData.phone,
    check_in_date: bookingData.checkIn,
    check_out_date: bookingData.checkOut,
    nights: bookingData.nights,
    guests: bookingData.guests,
    total_amount: bookingData.total,
    booking_date: new Date().toLocaleDateString(),
    special_requests: bookingData.specialRequests || "None",
  };

  return emailjs.send(
    SERVICE_ID,
    "owner_notification",
    templateParams,
    PUBLIC_KEY
  );
};
```

## 🎨 Template Customization

### Colors and Branding

Each template uses CSS variables that can be easily customized:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e293b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #dc2626;
}
```

### Logo and Images

- Replace the emoji logo (🏠) with your actual logo
- Add property images to the templates
- Update social media links

### Content Customization

- Update contact information
- Modify property descriptions
- Add local recommendations
- Include special offers or promotions

## 📱 Mobile Responsiveness

All templates are fully responsive and will look great on:

- Desktop computers
- Tablets
- Mobile phones
- Email clients (Gmail, Outlook, Apple Mail)

## 🔍 Testing

### Test Each Template

1. Use EmailJS's **Test** feature
2. Send test emails to yourself
3. Check formatting on different devices
4. Verify all variables are populated correctly

### Common Issues

- **Variables not showing**: Check template syntax `{{variable_name}}`
- **Styling issues**: Some email clients strip CSS
- **Images not loading**: Use absolute URLs for images
- **Fonts not working**: Use web-safe fonts as fallbacks

## 📊 Analytics

### Track Email Performance

- Monitor open rates
- Track click-through rates
- Measure booking conversion
- Analyze guest feedback

### EmailJS Analytics

- View delivery statistics
- Monitor bounce rates
- Track template performance

## 🚀 Advanced Features

### Automated Workflows

1. **Booking Confirmation**: Sent immediately after booking
2. **Reminder**: Sent 24-48 hours before check-in
3. **Thank You**: Sent after check-out
4. **Follow-up**: Sent 7 days after stay for reviews

### Personalization

- Use guest names throughout emails
- Include local weather information
- Add personalized recommendations
- Reference previous stays for returning guests

## 📞 Support

If you need help with EmailJS setup:

- **EmailJS Documentation**: [docs.emailjs.com](https://docs.emailjs.com/)
- **EmailJS Support**: support@emailjs.com
- **Community Forum**: [community.emailjs.com](https://community.emailjs.com/)

## 🔒 Security Best Practices

- Never expose your private keys in client-side code
- Use environment variables for sensitive data
- Validate all user inputs before sending emails
- Implement rate limiting for email sending
- Use HTTPS for all email communications

---

**Note**: These templates are designed specifically for Blue Haven on 13th Emperor. Customize the content, branding, and contact information to match your property.
