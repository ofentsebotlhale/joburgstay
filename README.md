# 🏠 Modern Johannesburg Apartment Booking System

A modern, responsive booking system for a Johannesburg Airbnb property featuring real-time availability, email notifications, and a professional booking experience.

## ✨ Features

- **📅 Interactive Calendar**: Real-time availability checking
- **📧 Email Notifications**: Automatic booking confirmations
- **💾 Data Persistence**: Backend API with localStorage fallback
- **📱 Responsive Design**: Works on all devices
- **🎨 Modern UI**: Clean, professional design with Tailwind CSS
- **🔒 Secure Booking**: Unique booking IDs and confirmation codes

## 🚀 Quick Start

### Option 1: Frontend Only (Static Hosting)

1. Upload all files to any static hosting service (Netlify, Vercel, GitHub Pages)
2. Update EmailJS configuration in `index.html`
3. Your site is ready!

### Option 2: Full Stack (Recommended)

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Backend Server**:

   ```bash
   npm start
   ```

3. **Start Frontend** (in another terminal):

   ```bash
   npx http-server -p 8000
   ```

4. **Access Your Site**: http://localhost:8000

## 📧 Email Setup (EmailJS)

1. Go to [EmailJS](https://www.emailjs.com/)
2. Create account and service
3. Create email templates:
   - **Owner Notification**: Notify property owner of new bookings
   - **Guest Confirmation**: Send confirmation to guests
4. Update `YOUR_PUBLIC_KEY` in `index.html`
5. Update service and template IDs in `app.js`

## 🌐 Deployment Options

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy both frontend and backend
3. Update `API_BASE_URL` in `app.js` to your Vercel domain

### Netlify + Railway

1. Deploy frontend to Netlify
2. Deploy backend to Railway
3. Update API URLs accordingly

### Traditional Hosting

1. Upload files to your web server
2. Set up Node.js environment for backend
3. Configure domain and SSL

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### EmailJS Templates

**Owner Notification Template**:

```
New Booking Received!

Booking ID: {{booking_id}}
Guest: {{guest_name}}
Email: {{guest_email}}
Phone: {{guest_phone}}
Check-in: {{check_in}}
Check-out: {{check_out}}
Guests: {{guests}}
Total: {{total}}
Special Requests: {{special_requests}}
Confirmation Code: {{confirmation_code}}
```

**Guest Confirmation Template**:

```
Booking Confirmation

Hello {{guest_name}},

Your booking has been confirmed!

Confirmation Code: {{confirmation_code}}
Check-in: {{check_in}}
Check-out: {{check_out}}
Total: {{total}}
Property: {{property_name}}

We'll contact you soon with check-in details.
```

## 📊 Data Structure

### Booking Object

```javascript
{
  id: "BK1234567890ABC",
  name: "John Doe",
  email: "john@example.com",
  phone: "+27123456789",
  guests: "2",
  checkIn: "2025-01-15",
  checkOut: "2025-01-17",
  specialRequests: "Late check-in",
  total: "R1150.00",
  timestamp: "2025-01-10T10:30:00.000Z",
  status: "pending",
  confirmationCode: "ABC12345"
}
```

## 🛠️ Customization

### Pricing

- Update `PRICE_PER_NIGHT` in `app.js`
- Modify cleaning fees and discounts

### Styling

- All styles use Tailwind CSS
- Update colors in `index.html`
- Modify `src/output.css` for custom styles

### Features

- Add payment integration
- Implement user accounts
- Add review system
- Include property management dashboard

## 🔒 Security Considerations

- All bookings are validated client and server-side
- EmailJS handles email security
- Backend includes CORS protection
- Data is stored securely with unique IDs

## 📞 Support

For technical support or customization requests, contact the development team.

## 📄 License

MIT License - Feel free to use and modify for your property.

---

**Ready to go live!** 🎉 Your Johannesburg apartment booking system is production-ready with professional features and reliable data handling.
