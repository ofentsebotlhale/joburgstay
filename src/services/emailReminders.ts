import { DatabaseService } from '../services/database';
import { sendBookingReminder, sendCheckoutReminder } from '../utils/emailjs';
import type { Booking } from '../types/booking';

export class EmailReminderService {
  // Check for bookings that need reminders
  static async checkAndSendReminders(): Promise<void> {
    try {
      console.log('Checking for email reminders...');
      
      const bookings = await DatabaseService.getBookings();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (const booking of bookings) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        
        // Check if booking is confirmed and not cancelled
        if (booking.status !== 'confirmed') continue;
        
        // Check-in reminder (24 hours before)
        if (this.isSameDay(checkInDate, tomorrow)) {
          await this.sendCheckInReminder(booking);
        }
        
        // Check-out reminder (24 hours before)
        if (this.isSameDay(checkOutDate, tomorrow)) {
          await this.sendCheckOutReminder(booking);
        }
      }
      
      console.log('Email reminder check completed');
    } catch (error) {
      console.error('Error checking email reminders:', error);
    }
  }
  
  // Send check-in reminder
  private static async sendCheckInReminder(booking: Booking): Promise<void> {
    try {
      console.log(`Sending check-in reminder for booking ${booking.confirmationCode}`);
      
      await sendBookingReminder({
        guest_name: booking.name,
        guest_email: booking.email,
        confirmation_code: booking.confirmationCode,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        guests: booking.guests,
        total_amount: booking.total,
        days_until_checkin: 1,
        special_requests: booking.specialRequests || 'None'
      });
      
      console.log(`Check-in reminder sent successfully for ${booking.confirmationCode}`);
    } catch (error) {
      console.error(`Failed to send check-in reminder for ${booking.confirmationCode}:`, error);
    }
  }
  
  // Send check-out reminder
  private static async sendCheckOutReminder(booking: Booking): Promise<void> {
    try {
      console.log(`Sending check-out reminder for booking ${booking.confirmationCode}`);
      
      await sendCheckoutReminder({
        guest_name: booking.name,
        guest_email: booking.email,
        confirmation_code: booking.confirmationCode,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        nights: booking.nights,
        guests: booking.guests,
        total_amount: booking.total,
        special_requests: booking.specialRequests || 'None'
      });
      
      console.log(`Check-out reminder sent successfully for ${booking.confirmationCode}`);
    } catch (error) {
      console.error(`Failed to send check-out reminder for ${booking.confirmationCode}:`, error);
    }
  }
  
  // Helper function to check if two dates are the same day
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  // Manual reminder sending (for testing)
  static async sendManualReminder(bookingId: string, type: 'checkin' | 'checkout'): Promise<void> {
    try {
      const bookings = await DatabaseService.getBookings();
      const booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      if (type === 'checkin') {
        await this.sendCheckInReminder(booking);
      } else {
        await this.sendCheckOutReminder(booking);
      }
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      throw error;
    }
  }
  
  // Get upcoming reminders (for admin dashboard)
  static async getUpcomingReminders(): Promise<{
    checkInReminders: Booking[];
    checkOutReminders: Booking[];
  }> {
    try {
      const bookings = await DatabaseService.getBookings();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const checkInReminders: Booking[] = [];
      const checkOutReminders: Booking[] = [];
      
      for (const booking of bookings) {
        if (booking.status !== 'confirmed') continue;
        
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        
        if (this.isSameDay(checkInDate, tomorrow)) {
          checkInReminders.push(booking);
        }
        
        if (this.isSameDay(checkOutDate, tomorrow)) {
          checkOutReminders.push(booking);
        }
      }
      
      return { checkInReminders, checkOutReminders };
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return { checkInReminders: [], checkOutReminders: [] };
    }
  }
}
