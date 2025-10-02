import { supabase, type BookingRow, type PaymentRow } from '../lib/supabase';
import type { Booking, BookingFormData } from '../types/booking';
import type { PaymentResult } from '../types/payment';

// Convert Supabase row to our Booking type
function convertBookingRow(row: BookingRow): Booking {
  return {
    id: row.id,
    confirmationCode: row.confirmation_code,
    name: row.guest_name,
    email: row.guest_email,
    phone: row.guest_phone,
    guests: row.guests,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    total: row.total_amount,
    specialRequests: row.special_requests,
    createdAt: row.created_at,
    // Add new fields from Supabase
    status: row.status,
    paymentStatus: row.payment_status,
  } as Booking & { status: string; paymentStatus: string };
}

// Convert our Booking type to Supabase insert format
function convertBookingToRow(booking: Booking): any {
  return {
    id: booking.id,
    confirmation_code: booking.confirmationCode,
    guest_name: booking.name,
    guest_email: booking.email,
    guest_phone: booking.phone,
    guests: booking.guests,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    nights: booking.nights,
    total_amount: booking.total,
    special_requests: booking.specialRequests,
    status: 'confirmed',
    payment_status: 'paid',
  };
}

// Database service functions
export class DatabaseService {
  // Get all bookings
  static async getBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      return data.map(convertBookingRow);
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Get bookings by email
  static async getBookingsByEmail(email: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings by email:', error);
        return [];
      }

      return data.map(convertBookingRow);
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Add new booking
  static async addBooking(
    formData: BookingFormData,
    checkIn: string,
    checkOut: string
  ): Promise<Booking> {
    const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const total = this.calculateTotal(nights);

    const bookingData = {
      confirmation_code: this.generateConfirmationCode(),
      guest_name: formData.name,
      guest_email: formData.email,
      guest_phone: formData.phone,
      guests: formData.guests,
      check_in: checkIn,
      check_out: checkOut,
      nights: nights,
      total_amount: total,
      special_requests: formData.specialRequests,
      status: 'pending',
      payment_status: 'pending',
    };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return convertBookingRow(data);
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: string, paymentStatus?: string): Promise<void> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Get blocked dates
  static async getBlockedDates(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .in('status', ['confirmed', 'pending']);

      if (error) {
        console.error('Error fetching blocked dates:', error);
        return [];
      }

      const blocked: string[] = [];
      data.forEach(booking => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);

        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!blocked.includes(dateStr)) {
            blocked.push(dateStr);
          }
        }
      });

      return blocked;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Add payment record
  static async addPayment(bookingId: string, payment: PaymentResult): Promise<void> {
    try {
      const paymentData = {
        booking_id: bookingId,
        payment_method: payment.method,
        amount: payment.amount,
        fee: payment.fee,
        total_paid: payment.totalPaid,
        reference: payment.reference,
        status: payment.success ? 'success' : 'failed',
      };

      const { error } = await supabase
        .from('payments')
        .insert(paymentData);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  // Get payments for booking
  static async getPaymentsForBooking(bookingId: string): Promise<PaymentResult[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return [];
      }

      return data.map(payment => ({
        success: payment.status === 'success',
        reference: payment.reference,
        method: payment.payment_method,
        amount: payment.amount,
        fee: payment.fee,
        totalPaid: payment.total_paid,
        timestamp: payment.created_at,
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Utility functions (moved from booking.ts)
  static calculateTotal(nights: number): number {
    const PRICE_PER_NIGHT = 500;
    const CLEANING_FEE = 150;
    const DISCOUNT_THRESHOLD = 7;
    const DISCOUNT_PERCENTAGE = 0.1;

    let subtotal = nights * PRICE_PER_NIGHT;
    let discount = 0;

    if (nights >= DISCOUNT_THRESHOLD) {
      discount = subtotal * DISCOUNT_PERCENTAGE;
    }

    const total = subtotal + CLEANING_FEE - discount;
    return Math.round(total);
  }

  static generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}
