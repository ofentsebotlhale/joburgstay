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
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  specialRequests?: string;
}
