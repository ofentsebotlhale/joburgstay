import type { Booking, BookingFormData } from '../types/booking';

export const PRICE_PER_NIGHT = 500;
export const CLEANING_FEE = 150;
export const DISCOUNT_THRESHOLD = 7;
export const DISCOUNT_PERCENTAGE = 0.1;

export function calculateTotal(nights: number): number {
  let subtotal = nights * PRICE_PER_NIGHT;
  let discount = 0;

  if (nights >= DISCOUNT_THRESHOLD) {
    discount = subtotal * DISCOUNT_PERCENTAGE;
  }

  const total = subtotal + CLEANING_FEE - discount;
  return Math.round(total);
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
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const bookings = localStorage.getItem('blueHavenBookings');
    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

export async function addBooking(
  formData: BookingFormData,
  checkIn: string,
  checkOut: string
): Promise<Booking> {
  const bookings = await getBookings();
  const nights = daysBetween(checkIn, checkOut);
  const total = calculateTotal(nights);

  const newBooking: Booking = {
    ...formData,
    id: generateBookingId(),
    confirmationCode: generateConfirmationCode(),
    checkIn,
    checkOut,
    nights,
    total,
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  localStorage.setItem('blueHavenBookings', JSON.stringify(bookings));

  return newBooking;
}

export async function getBlockedDates(): Promise<string[]> {
  try {
    const bookings = await getBookings();
    const blocked: string[] = [];

    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!blocked.includes(dateStr)) {
          blocked.push(dateStr);
        }
      }
    });

    return blocked;
  } catch (error) {
    console.error('Error getting blocked dates:', error);
    return [];
  }
}
