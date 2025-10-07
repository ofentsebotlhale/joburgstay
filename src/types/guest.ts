export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lastLoginAt?: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

export interface GuestLoginData {
  email: string;
  bookingId?: string; // For first-time login with booking reference
}

export interface GuestSession {
  guestId: string;
  email: string;
  name: string;
  loginTime: string;
  expiresAt: string;
}

export interface Review {
  id: string;
  guestId: string;
  bookingId: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  helpful: number;
}

export interface GuestPortalStats {
  totalBookings: number;
  upcomingBookings: number;
  pastBookings: number;
  totalSpent: number;
  averageRating: number;
  reviewsGiven: number;
}
