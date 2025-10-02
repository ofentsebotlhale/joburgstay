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
      console.warn('EmailJS not available');
      return;
    }

    // Send booking confirmation to guest
    await window.emailjs.send("service_2mja4zm", "booking_confirmation", {
      guest_name: booking.name,
      confirmation_code: booking.confirmationCode,
      check_in_date: booking.checkIn,
      check_out_date: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      total_amount: booking.total,
    });

    // Send notification to owner
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

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
}
