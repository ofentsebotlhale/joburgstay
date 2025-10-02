import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          confirmation_code: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guests: number;
          check_in: string;
          check_out: string;
          nights: number;
          total_amount: number;
          special_requests?: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          confirmation_code: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guests: number;
          check_in: string;
          check_out: string;
          nights: number;
          total_amount: number;
          special_requests?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          confirmation_code?: string;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string;
          guests?: number;
          check_in?: string;
          check_out?: string;
          nights?: number;
          total_amount?: number;
          special_requests?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          payment_method: string;
          amount: number;
          fee: number;
          total_paid: number;
          reference: string;
          status: 'pending' | 'success' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payment_method: string;
          amount: number;
          fee: number;
          total_paid: number;
          reference: string;
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          payment_method?: string;
          amount?: number;
          fee?: number;
          total_paid?: number;
          reference?: string;
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
      };
    };
  };
}

export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
