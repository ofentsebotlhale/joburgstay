# Email Reminders Setup Guide

## 📧 **Automated Email Reminders - Phase 1 Complete!**

Your Blue Haven booking system now includes **automated email reminders** that will enhance the guest experience significantly!

## ✅ **What's Been Implemented:**

### **1. Automated Reminder System**
- **Check-in reminders** sent 24 hours before arrival
- **Check-out reminders** sent 24 hours before departure
- **Automatic scheduling** runs every hour
- **Manual trigger** capability for testing

### **2. Professional Email Templates**
- **Booking reminder template** (`booking_reminder.html`)
- **Checkout reminder template** (`checkout_reminder.html`)
- **Mobile-responsive design**
- **South African branding** and contact information

### **3. Enhanced Booking Management**
- **Manual reminder buttons** in booking portal
- **Reminder status tracking**
- **Upcoming reminders preview**
- **Error handling** with fallback systems

## 🔧 **EmailJS Template Setup:**

### **Step 1: Create Booking Reminder Template**

1. **Go to EmailJS Dashboard** → **Email Templates**
2. **Click "Create New Template"**
3. **Configure Template:**

   **Template Settings:**
   - **Template ID**: `booking_reminder`
   - **Template Name**: "Booking Reminder"
   - **Subject**: "Your Stay Starts Tomorrow - Blue Haven"
   - **To Email**: `{{guest_email}}`
   - **From Name**: "Blue Haven on 13th Emperor"

   **Template Content:**
   - Copy entire content from `email-templates/booking-reminder.html`

   **Template Variables:**
   - `{{guest_name}}`
   - `{{guest_email}}`
   - `{{confirmation_code}}`
   - `{{check_in_date}}`
   - `{{check_out_date}}`
   - `{{guests}}`
   - `{{total_amount}}`
   - `{{days_until_checkin}}`
   - `{{special_requests}}`

### **Step 2: Create Checkout Reminder Template**

1. **Create New Template**
2. **Configure Template:**

   **Template Settings:**
   - **Template ID**: `checkout_reminder`
   - **Template Name**: "Checkout Reminder"
   - **Subject**: "Check-out Reminder - Blue Haven"
   - **To Email**: `{{guest_email}}`
   - **From Name**: "Blue Haven on 13th Emperor"

   **Template Content:**
   - Copy entire content from `email-templates/checkout-reminder.html`

   **Template Variables:**
   - `{{guest_name}}`
   - `{{guest_email}}`
   - `{{confirmation_code}}`
   - `{{check_in_date}}`
   - `{{check_out_date}}`
   - `{{nights}}`
   - `{{guests}}`
   - `{{total_amount}}`
   - `{{special_requests}}`

## 🎯 **How It Works:**

### **Automatic Reminders:**
1. **Scheduler runs every hour**
2. **Checks all confirmed bookings**
3. **Identifies bookings needing reminders**
4. **Sends appropriate reminder emails**
5. **Logs all activities**

### **Manual Reminders:**
1. **Open booking management portal**
2. **Search for guest bookings**
3. **Click "Check-in Reminder" or "Check-out Reminder"**
4. **Email sent immediately**

## 📋 **Reminder Schedule:**

### **Check-in Reminder (24h before):**
- **When**: 24 hours before check-in date
- **Content**: Welcome message, check-in instructions, contact info
- **Includes**: Smart lock details, parking info, emergency contacts

### **Check-out Reminder (24h before):**
- **When**: 24 hours before check-out date
- **Content**: Check-out instructions, departure checklist
- **Includes**: Key return, cleaning checklist, thank you message

## 🧪 **Testing:**

### **Test Manual Reminders:**
1. **Create a test booking**
2. **Open booking management portal**
3. **Search by email address**
4. **Click reminder buttons**
5. **Check email delivery**

### **Test Automatic Reminders:**
1. **Create booking with tomorrow's date**
2. **Wait for scheduler to run**
3. **Check console logs**
4. **Verify email delivery**

## 📊 **Monitoring:**

### **Console Logs:**
- **Reminder scheduler status**
- **Email sending attempts**
- **Success/failure notifications**
- **Error handling details**

### **EmailJS Dashboard:**
- **Delivery statistics**
- **Template performance**
- **Bounce rates**
- **Open rates**

## 🔧 **Configuration Options:**

### **Scheduler Timing:**
```typescript
// Current: Every hour
setInterval(checkReminders, 60 * 60 * 1000);

// Customize timing:
setInterval(checkReminders, 30 * 60 * 1000); // Every 30 minutes
setInterval(checkReminders, 2 * 60 * 60 * 1000); // Every 2 hours
```

### **Reminder Timing:**
```typescript
// Current: 24 hours before
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Customize timing:
tomorrow.setDate(tomorrow.getDate() + 2); // 48 hours before
tomorrow.setHours(tomorrow.getHours() + 12); // 12 hours before
```

## 🚀 **Benefits:**

### **For Guests:**
- **Never miss check-in/check-out times**
- **Clear instructions and expectations**
- **Professional communication**
- **Reduced anxiety about arrival**

### **For Hosts:**
- **Reduced no-shows**
- **Better guest experience**
- **Automated communication**
- **Professional image**

### **For Business:**
- **Higher guest satisfaction**
- **Reduced support requests**
- **Better reviews**
- **Operational efficiency**

## 🛠️ **Troubleshooting:**

### **Common Issues:**

1. **Reminders not sending:**
   - Check EmailJS template IDs
   - Verify template variables
   - Check console for errors

2. **Wrong timing:**
   - Verify date calculations
   - Check timezone settings
   - Review scheduler interval

3. **Template errors:**
   - Validate HTML syntax
   - Check variable names
   - Test with EmailJS preview

### **Debug Commands:**
```javascript
// Check scheduler status
console.log('Scheduler active:', ReminderScheduler.isActive());

// Manual trigger
ReminderScheduler.triggerCheck();

// Get upcoming reminders
ReminderScheduler.getUpcomingReminders();
```

## 📈 **Future Enhancements:**

### **Phase 2 Improvements:**
- **SMS reminders** via WhatsApp
- **Customizable reminder timing**
- **Multi-language support**
- **Guest preference settings**

### **Advanced Features:**
- **Weather updates** in reminders
- **Local event suggestions**
- **Transportation options**
- **Restaurant recommendations**

---

**🎉 Congratulations!** Your Blue Haven booking system now provides **professional, automated guest communication** that will significantly improve the guest experience!
