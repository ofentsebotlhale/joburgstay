import type { Booking, BookingFormData } from '../types/booking';
import { DatabaseService } from '../services/database';

// Re-export utility functions for backward compatibility
export const PRICE_PER_NIGHT = 500;
export const CLEANING_FEE = 150;
export const DISCOUNT_THRESHOLD = 7;
export const DISCOUNT_PERCENTAGE = 0.1;

export function calculateTotal(nights: number): number {
  return DatabaseService.calculateTotal(nights);
}

export function daysBetween(dateA: string, dateB: string): number {
  return Math.round((new Date(dateB).getTime() - new Date(dateA).getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function generateBookingId(): string {
  return 'BH' + Date.now().toString(36).toUpperCase();
}

export function generateConfirmationCode(): string {
  return DatabaseService.generateConfirmationCode();
}

// Updated functions to use Supabase
export async function getBookings(): Promise<Booking[]> {
  return DatabaseService.getBookings();
}

export async function addBooking(
  formData: BookingFormData,
  checkIn: string,
  checkOut: string
): Promise<Booking> {
  return DatabaseService.addBooking(formData, checkIn, checkOut);
}

export async function getBlockedDates(): Promise<string[]> {
  return DatabaseService.getBlockedDates();
}

// New functions for enhanced functionality
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  return DatabaseService.getBookingsByEmail(email);
}

export async function updateBookingStatus(bookingId: string, status: string, paymentStatus?: string): Promise<void> {
  return DatabaseService.updateBookingStatus(bookingId, status, paymentStatus);
}