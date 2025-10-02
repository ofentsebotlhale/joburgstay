# Supabase Setup Guide for Blue Haven

## 🚀 **Phase 1: Supabase Integration Complete!**

Your Blue Haven booking system now has **Supabase integration** ready to replace localStorage with a real database. Here's what's been implemented:

## ✅ **What's New:**

### **1. Database Integration**
- **Supabase client** configured with TypeScript types
- **Database service** with full CRUD operations
- **Automatic fallback** to localStorage if Supabase is unavailable
- **Real-time data sync** capabilities

### **2. Enhanced Booking Management**
- **Booking management portal** for viewing/searching bookings
- **Status tracking** (pending, confirmed, cancelled, completed)
- **Payment status** tracking (pending, paid, failed, refunded)
- **Email-based booking search** functionality

### **3. Improved Data Structure**
- **Enhanced booking types** with status fields
- **Payment records** stored in separate table
- **Audit trail** with created/updated timestamps

## 🔧 **Setup Instructions:**

### **Step 1: Create Supabase Project**

1. **Go to [Supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Create New Project**:
   - Project Name: `blue-haven-bookings`
   - Database Password: Generate strong password
   - Region: Choose closest to South Africa
4. **Wait for setup** (2-3 minutes)

### **Step 2: Create Database Tables**

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code VARCHAR(20) UNIQUE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL CHECK (nights > 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  total_paid DECIMAL(10,2) NOT NULL,
  reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_email ON bookings(guest_email);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your needs)
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
```

### **Step 3: Get Your Supabase Credentials**

1. **Go to Project Settings** → **API**
2. **Copy your credentials**:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 4: Configure Environment Variables**

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# EmailJS Configuration (existing)
VITE_EMAILJS_PUBLIC_KEY=33HWU_f44zZmuXLVu
VITE_EMAILJS_SERVICE_ID=service_2mja4zm
```

### **Step 5: Test the Integration**

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test booking flow**:
   - Make a test booking
   - Check Supabase dashboard → Table Editor → bookings
   - Verify data is being stored

3. **Test booking management**:
   - Click "Manage" button in navbar
   - Search by email address
   - Verify bookings appear

## 🎯 **New Features Available:**

### **Booking Management Portal**
- **Search bookings** by guest email
- **Filter by status** (pending, confirmed, cancelled, completed)
- **Update booking status** with one click
- **View detailed booking information**
- **Track payment status**

### **Enhanced Data Storage**
- **Persistent bookings** that survive browser clears
- **Real-time updates** across multiple devices
- **Audit trail** with timestamps
- **Scalable architecture** for future growth

### **Improved User Experience**
- **Status tracking** throughout booking lifecycle
- **Payment integration** with database records
- **Better error handling** with fallback systems

## 🔄 **Migration from localStorage**

The system automatically handles migration:
- **New bookings** go to Supabase
- **Existing localStorage data** remains accessible
- **Gradual migration** as users make new bookings

## 🚀 **Next Steps (Phase 2):**

1. **User Authentication** - Guest accounts and login
2. **Email Reminders** - Automated check-in/check-out emails
3. **SMS Notifications** - WhatsApp integration for SA guests
4. **SEO Optimization** - Better Google visibility

## 🛠️ **Troubleshooting:**

### **Common Issues:**

1. **"Invalid API key" error**:
   - Check your `.env.local` file
   - Verify Supabase URL and anon key

2. **"Table doesn't exist" error**:
   - Run the SQL commands in Supabase SQL Editor
   - Check table names match exactly

3. **"RLS policy" error**:
   - Ensure RLS policies are created
   - Check policy permissions

### **Testing Commands:**

```bash
# Check if Supabase is connected
npm run dev
# Open browser console and look for Supabase connection logs

# Test booking creation
# Make a test booking and check Supabase dashboard
```

## 📊 **Monitoring:**

- **Supabase Dashboard** → **Table Editor** to view bookings
- **Supabase Dashboard** → **Logs** to monitor API calls
- **Browser Console** for client-side errors

---

**🎉 Congratulations!** Your Blue Haven booking system now has enterprise-grade database capabilities with Supabase integration!
