export interface Booking {
  id: string;
  confirmationCode: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  specialRequests?: string;
  createdAt: string;
  // New fields for Supabase integration
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  specialRequests?: string;
}
