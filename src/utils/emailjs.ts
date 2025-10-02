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

    await window.emailjs.send("service_2mja4zm", "guest_confirm", {
      guest_name: booking.name,
      guest_email: booking.email,
      confirmation_code: booking.confirmationCode,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total: booking.total,
      property_name: "Blue Haven on 13th Emperor",
    });

    await window.emailjs.send("service_2mja4zm", "owner_alert", {
      guest_name: booking.name,
      guest_email: booking.email,
      guest_phone: booking.phone,
      confirmation_code: booking.confirmationCode,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      total: booking.total,
      special_requests: booking.specialRequests || 'None',
      property_name: "Blue Haven on 13th Emperor",
    });

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
}
