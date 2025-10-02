# 🚀 Netlify Deployment Guide

## Quick Deployment Steps

### Option 1: Drag & Drop (Fastest)

1. **Zip your project folder** (excluding `node_modules`)
2. **Go to [netlify.com](https://netlify.com)**
3. **Drag & drop** your zip file
4. **Your site is live!** 🎉

### Option 2: Git Integration (Recommended)

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial JoburgStay booking system"
   git remote add origin https://github.com/yourusername/joburgstay.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub account
   - Select your repository
   - Deploy!

## 🔧 Post-Deployment Configuration

### 1. Update EmailJS Configuration

After deployment, update your site URL in `app.js`:

```javascript
const API_BASE_URL = "https://your-actual-site-name.netlify.app/api";
```

### 2. Set Up EmailJS Templates

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Create templates:
   - `guest_confirm` (copy from `booking-confirmation-template.html`)
   - `owner_alert` (copy from `owner-notification-template.html`)

### 3. Test Your Site

1. Visit your Netlify URL
2. Test the booking system
3. Check email notifications

## 📧 EmailJS Setup Checklist

- [ ] Public Key: `33HWU_f44zZmuXLVu` ✅
- [ ] Service ID: `service_2mja4zm` ✅
- [x] Create guest confirmation template (`guest_confirm`)
- [x] Create owner notification template (`owner_alert`)
- [ ] Test email sending

## 🌐 Custom Domain (Optional)

1. **In Netlify Dashboard**:

   - Go to Site Settings → Domain Management
   - Add your custom domain
   - Update DNS records

2. **Update EmailJS**:
   - Update site URL in configuration
   - Test booking system

## 🔒 Security Features

Your deployed site includes:

- ✅ HTTPS by default
- ✅ Security headers
- ✅ CORS protection
- ✅ Input validation
- ✅ EmailJS integration

## 📊 Analytics (Optional)

Add Netlify Analytics:

1. Go to Site Settings → Analytics
2. Enable Netlify Analytics
3. Track bookings and visitors

## 🆘 Troubleshooting

### Common Issues:

1. **EmailJS not working**: Check public key and service ID
2. **Styling issues**: Clear browser cache
3. **Booking not saving**: Check browser console for errors

### Support:

- Check Netlify deployment logs
- Test locally with `npm run preview`
- Verify EmailJS configuration

---

**Your JoburgStay booking system is ready for production!** 🎉
