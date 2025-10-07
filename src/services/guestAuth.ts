import type { Guest, GuestLoginData, GuestSession, Review, GuestPortalStats } from '../types/guest';
import type { Booking } from '../types/booking';

class GuestAuthService {
  private static readonly GUEST_SESSION_KEY = 'guest_session';
  private static readonly GUEST_DATA_KEY = 'guest_data';
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Login with email and optional booking ID
  static async login(loginData: GuestLoginData): Promise<Guest> {
    try {
      // Check if guest exists by email
      let guest = await this.getGuestByEmail(loginData.email);
      
      if (!guest) {
        // Create new guest account
        guest = await this.createGuestAccount(loginData);
      }

      // Create session
      const session: GuestSession = {
        guestId: guest.id,
        email: guest.email,
        name: guest.name,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString()
      };

      localStorage.setItem(this.GUEST_SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(this.GUEST_DATA_KEY, JSON.stringify(guest));

      return guest;
    } catch (error) {
      console.error('Guest login error:', error);
      throw new Error('Failed to login. Please try again.');
    }
  }

  // Logout guest
  static logout(): void {
    localStorage.removeItem(this.GUEST_SESSION_KEY);
    localStorage.removeItem(this.GUEST_DATA_KEY);
  }

  // Check if guest is authenticated
  static isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return false;
    }

    return true;
  }

  // Get current guest session
  static getSession(): GuestSession | null {
    try {
      const sessionData = localStorage.getItem(this.GUEST_SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  // Get current guest data
  static getCurrentGuest(): Guest | null {
    try {
      const guestData = localStorage.getItem(this.GUEST_DATA_KEY);
      return guestData ? JSON.parse(guestData) : null;
    } catch {
      return null;
    }
  }

  // Get guest by email
  private static async getGuestByEmail(email: string): Promise<Guest | null> {
    try {
      // Check localStorage first
      const guests = this.getLocalGuests();
      const guest = guests.find(g => g.email.toLowerCase() === email.toLowerCase());
      
      if (guest) {
        return guest;
      }

      // If using Supabase, check there too
      if (typeof window !== 'undefined' && window.supabase) {
        const { data, error } = await window.supabase
          .from('guests')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase error:', error);
        }

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting guest by email:', error);
      return null;
    }
  }

  // Create new guest account
  private static async createGuestAccount(loginData: GuestLoginData): Promise<Guest> {
    const guest: Guest = {
      id: this.generateGuestId(),
      name: '', // Will be filled from booking data
      email: loginData.email.toLowerCase(),
      phone: '',
      createdAt: new Date().toISOString(),
      totalBookings: 0,
      totalSpent: 0,
      status: 'active'
    };

    // Try to get guest info from existing booking
    if (loginData.bookingId) {
      const booking = await this.getBookingById(loginData.bookingId);
      if (booking) {
        guest.name = booking.name;
        guest.phone = booking.phone;
        guest.totalBookings = 1;
        guest.totalSpent = booking.total || 0;
      }
    }

    // Save guest locally
    const guests = this.getLocalGuests();
    guests.push(guest);
    localStorage.setItem('guests', JSON.stringify(guests));

    // Save to Supabase if available
    if (typeof window !== 'undefined' && window.supabase) {
      try {
        await window.supabase
          .from('guests')
          .insert([{
            id: guest.id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            created_at: guest.createdAt,
            total_bookings: guest.totalBookings,
            total_spent: guest.totalSpent,
            status: guest.status
          }]);
      } catch (error) {
        console.error('Error saving guest to Supabase:', error);
      }
    }

    return guest;
  }

  // Get booking by ID
  private static async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      // Check localStorage first
      const bookings = this.getLocalBookings();
      const booking = bookings.find(b => b.id === bookingId);
      
      if (booking) {
        return booking;
      }

      // Check Supabase if available
      if (typeof window !== 'undefined' && window.supabase) {
        const { data, error } = await window.supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase error:', error);
        }

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  }

  // Get local guests
  private static getLocalGuests(): Guest[] {
    try {
      const guests = localStorage.getItem('guests');
      return guests ? JSON.parse(guests) : [];
    } catch {
      return [];
    }
  }

  // Get local bookings
  private static getLocalBookings(): Booking[] {
    try {
      const bookings = localStorage.getItem('bookings');
      return bookings ? JSON.parse(bookings) : [];
    } catch {
      return [];
    }
  }

  // Generate unique guest ID
  private static generateGuestId(): string {
    return 'GUEST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Update guest stats
  static async updateGuestStats(guestId: string): Promise<void> {
    try {
      const bookings = this.getLocalBookings();
      const guestBookings = bookings.filter(b => b.email === this.getCurrentGuest()?.email);
      
      const totalBookings = guestBookings.length;
      const totalSpent = guestBookings.reduce((sum, b) => sum + (b.total || 0), 0);

      // Update local guest data
      const guests = this.getLocalGuests();
      const guestIndex = guests.findIndex(g => g.id === guestId);
      
      if (guestIndex !== -1) {
        guests[guestIndex].totalBookings = totalBookings;
        guests[guestIndex].totalSpent = totalSpent;
        localStorage.setItem('guests', JSON.stringify(guests));

        // Update current guest data
        const currentGuest = this.getCurrentGuest();
        if (currentGuest && currentGuest.id === guestId) {
          currentGuest.totalBookings = totalBookings;
          currentGuest.totalSpent = totalSpent;
          localStorage.setItem(this.GUEST_DATA_KEY, JSON.stringify(currentGuest));
        }
      }

      // Update Supabase if available
      if (typeof window !== 'undefined' && window.supabase) {
        await window.supabase
          .from('guests')
          .update({
            total_bookings: totalBookings,
            total_spent: totalSpent
          })
          .eq('id', guestId);
      }
    } catch (error) {
      console.error('Error updating guest stats:', error);
    }
  }

  // Get guest portal stats
  static async getGuestStats(guestId: string): Promise<GuestPortalStats> {
    try {
      const bookings = this.getLocalBookings();
      const guest = this.getCurrentGuest();
      
      if (!guest) {
        throw new Error('Guest not found');
      }

      const guestBookings = bookings.filter(b => b.email === guest.email);
      const now = new Date();
      
      const upcomingBookings = guestBookings.filter(b => 
        new Date(b.checkIn) > now
      ).length;
      
      const pastBookings = guestBookings.filter(b => 
        new Date(b.checkOut) < now
      ).length;

      const totalSpent = guestBookings.reduce((sum, b) => sum + (b.total || 0), 0);

      // Get reviews count
      const reviews = this.getLocalReviews();
      const reviewsGiven = reviews.filter(r => r.guestId === guestId).length;

      return {
        totalBookings: guestBookings.length,
        upcomingBookings,
        pastBookings,
        totalSpent,
        averageRating: 0, // Will be calculated from reviews
        reviewsGiven
      };
    } catch (error) {
      console.error('Error getting guest stats:', error);
      return {
        totalBookings: 0,
        upcomingBookings: 0,
        pastBookings: 0,
        totalSpent: 0,
        averageRating: 0,
        reviewsGiven: 0
      };
    }
  }

  // Get local reviews
  private static getLocalReviews(): Review[] {
    try {
      const reviews = localStorage.getItem('reviews');
      return reviews ? JSON.parse(reviews) : [];
    } catch {
      return [];
    }
  }
}

export default GuestAuthService;
