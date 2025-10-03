import type { Booking } from '../types/booking';

declare global {
  interface Window {
    emailjs?: {
      send: (serviceId: string, templateId: string, params: Record<string, unknown>) => Promise<void>;
      init: (publicKey: string) => void;
    };
  }
}

export async function sendBookingNotifications(booking: Booking): Promise<void> {
  try {
    if (typeof window.emailjs === 'undefined') {
      console.warn('EmailJS not available - skipping email notifications');
      return;
    }

    console.log('Attempting to send email notifications...');

    // Send booking confirmation to guest
    try {
      await window.emailjs.send("service_2mja4zm", "booking_confirmation", {
        guest_name: booking.name,
        guest_email: booking.email,
        confirmation_code: booking.confirmationCode,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        check_in_time: booking.checkInTime || '3:00 PM',
        nights: booking.nights,
        guests: booking.guests,
        total_amount: booking.total,
      });
      console.log('Guest confirmation email sent successfully');
    } catch (guestError) {
      console.warn('Failed to send guest confirmation email:', guestError);
      // Don't throw - continue with owner notification
    }

    // Send notification to owner
    try {
      await window.emailjs.send("service_2mja4zm", "owner_notification", {
        booking_id: booking.id,
        confirmation_code: booking.confirmationCode,
        guest_name: booking.name,
        guest_email: booking.email,
        guest_phone: booking.phone,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        check_in_time: booking.checkInTime || '3:00 PM',
        nights: booking.nights,
        guests: booking.guests,
        total_amount: booking.total,
        booking_date: new Date().toLocaleDateString(),
        special_requests: booking.specialRequests || 'None',
        // Note: owner email should be configured in EmailJS template settings
      });
      console.log('Owner notification email sent successfully');
    } catch (ownerError) {
      console.warn('Failed to send owner notification email:', ownerError);
      // Don't throw - email failures shouldn't break the booking
    }

    console.log('Email notification process completed');
  } catch (error) {
    console.error('Email notification system error:', error);
    // Don't throw - email failures shouldn't break the booking process
  }
}

// Send booking reminder (24h before check-in)
export async function sendBookingReminder(params: {
  guest_name: string;
  guest_email: string;
  confirmation_code: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_amount: number;
  days_until_checkin: number;
  special_requests?: string;
}): Promise<void> {
  try {
    if (typeof window.emailjs === 'undefined') {
      console.warn('EmailJS not available - skipping reminder email');
      return;
    }

    await window.emailjs.send("service_2mja4zm", "booking_reminder", {
      guest_name: params.guest_name,
      guest_email: params.guest_email,
      confirmation_code: params.confirmation_code,
      check_in_date: params.check_in_date,
      check_out_date: params.check_out_date,
      guests: params.guests,
      total_amount: params.total_amount,
      days_until_checkin: params.days_until_checkin,
      special_requests: params.special_requests || 'None',
    });
    
    console.log('Booking reminder sent successfully');
  } catch (error) {
    console.error('Failed to send booking reminder:', error);
    throw error;
  }
}

// Send checkout reminder (24h before check-out)
export async function sendCheckoutReminder(params: {
  guest_name: string;
  guest_email: string;
  confirmation_code: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guests: number;
  total_amount: number;
  special_requests?: string;
}): Promise<void> {
  try {
    if (typeof window.emailjs === 'undefined') {
      console.warn('EmailJS not available - skipping checkout reminder');
      return;
    }

    await window.emailjs.send("service_2mja4zm", "checkout_reminder", {
      guest_name: params.guest_name,
      guest_email: params.guest_email,
      confirmation_code: params.confirmation_code,
      check_in_date: params.check_in_date,
      check_out_date: params.check_out_date,
      nights: params.nights,
      guests: params.guests,
      total_amount: params.total_amount,
      special_requests: params.special_requests || 'None',
    });
    
    console.log('Checkout reminder sent successfully');
  } catch (error) {
    console.error('Failed to send checkout reminder:', error);
    throw error;
  }
}
