# EmailJS Setup Fix - "Recipients address is empty" Error

## 🚨 **Current Error:**
```
POST https://api.emailjs.com/api/v1.0/email/send 422 (Unprocessable Content)
"The recipients address is empty"
```

## 🔧 **Root Cause:**
EmailJS requires recipient email addresses to be configured in the **template settings**, not passed as parameters in the code.

## ✅ **Solution Steps:**

### **Step 1: Create EmailJS Templates**

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/
2. **Navigate to Email Templates**
3. **Click "Create New Template"**

### **Step 2: Create Booking Confirmation Template**

**Template Settings:**
- **Template ID**: `booking_confirmation`
- **Template Name**: "Booking Confirmation"
- **Subject**: "Booking Confirmed - Blue Haven on 13th Emperor"

**Recipient Configuration:**
- **To Email**: `{{guest_email}}` (this is the key fix!)
- **From Name**: "Blue Haven on 13th Emperor"

**Template Content:**
Copy the entire content from `email-templates/booking-confirmation.html`

**Template Variables:**
Make sure these variables are available in the template:
- `{{guest_name}}`
- `{{confirmation_code}}`
- `{{check_in_date}}`
- `{{check_out_date}}`
- `{{nights}}`
- `{{guests}}`
- `{{total_amount}}`

### **Step 3: Create Owner Notification Template**

**Template Settings:**
- **Template ID**: `owner_notification`
- **Template Name**: "Owner Notification"
- **Subject**: "New Booking Alert - Blue Haven"

**Recipient Configuration:**
- **To Email**: `your-email@example.com` (your actual email address)
- **From Name**: "Blue Haven Booking System"

**Template Content:**
Copy the entire content from `email-templates/owner-notification.html`

**Template Variables:**
Make sure these variables are available in the template:
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

## 🔑 **Critical Configuration Points:**

### **1. Recipient Email Setup:**
- ✅ **Guest Template**: Set "To Email" to `{{guest_email}}`
- ✅ **Owner Template**: Set "To Email" to your actual email address
- ❌ **Don't pass recipient emails** in the JavaScript code

### **2. Template ID Matching:**
- ✅ **Must match exactly**: `booking_confirmation` and `owner_notification`
- ✅ **Case sensitive**: Use lowercase with underscores

### **3. Service Configuration:**
- ✅ **Service ID**: `service_2mja4zm`
- ✅ **Public Key**: `33HWU_f44zZmuXLVu`

## 🧪 **Testing:**

### **Test Guest Confirmation:**
1. **Use EmailJS Test Feature**
2. **Send test with sample data:**
   ```json
   {
     "guest_name": "John Doe",
     "confirmation_code": "TEST123",
     "check_in_date": "2025-01-15",
     "check_out_date": "2025-01-17",
     "nights": 2,
     "guests": 2,
     "total_amount": 1150
   }
   ```

### **Test Owner Notification:**
1. **Use EmailJS Test Feature**
2. **Send test with sample data:**
   ```json
   {
     "booking_id": "BH123456",
     "confirmation_code": "TEST123",
     "guest_name": "John Doe",
     "guest_email": "john@example.com",
     "guest_phone": "+27 11 123 4567",
     "check_in_date": "2025-01-15",
     "check_out_date": "2025-01-17",
     "nights": 2,
     "guests": 2,
     "total_amount": 1150,
     "booking_date": "2025-01-10",
     "special_requests": "Late check-in requested"
   }
   ```

## 🚨 **Common Mistakes to Avoid:**

1. **❌ Don't pass recipient emails** in JavaScript parameters
2. **❌ Don't use wrong template IDs** (case sensitive)
3. **❌ Don't forget to set "To Email"** in template settings
4. **❌ Don't use HTML in subject lines** (plain text only)

## ✅ **Expected Result:**

After proper setup:
- ✅ **Guest receives** booking confirmation email
- ✅ **Owner receives** booking notification email
- ✅ **No more 422 errors** in console
- ✅ **Booking process** completes successfully

## 🔍 **Debugging:**

If emails still don't work:
1. **Check EmailJS dashboard** for delivery logs
2. **Verify template IDs** match exactly
3. **Test templates** using EmailJS test feature
4. **Check spam folder** for test emails
5. **Verify service configuration** is correct

---

**Note**: The booking system will work perfectly even without emails - this is just for email notifications!
