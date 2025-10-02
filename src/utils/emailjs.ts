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
        confirmation_code: booking.confirmationCode,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
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
        nights: booking.nights,
        guests: booking.guests,
        total_amount: booking.total,
        booking_date: new Date().toLocaleDateString(),
        special_requests: booking.specialRequests || 'None',
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
