export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      calendars: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_account_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          provider_account_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_account_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      availability_schedules: {
        Row: {
          id: string
          user_id: string
          name: string
          timezone: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          timezone?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          timezone?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          schedule_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      date_overrides: {
        Row: {
          id: string
          schedule_id: string
          date: string
          is_unavailable: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          date: string
          is_unavailable?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          date?: string
          is_unavailable?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
      }
      event_types: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string | null
          duration_minutes: number
          location_type: string
          location_details: string | null
          color: string
          is_active: boolean
          buffer_minutes_before: number
          buffer_minutes_after: number
          max_bookings_per_day: number | null
          min_notice_hours: number
          max_days_in_advance: number
          price_cents: number
          currency: string
          schedule_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description?: string | null
          duration_minutes?: number
          location_type?: string
          location_details?: string | null
          color?: string
          is_active?: boolean
          buffer_minutes_before?: number
          buffer_minutes_after?: number
          max_bookings_per_day?: number | null
          min_notice_hours?: number
          max_days_in_advance?: number
          price_cents?: number
          currency?: string
          schedule_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string | null
          duration_minutes?: number
          location_type?: string
          location_details?: string | null
          color?: string
          is_active?: boolean
          buffer_minutes_before?: number
          buffer_minutes_after?: number
          max_bookings_per_day?: number | null
          min_notice_hours?: number
          max_days_in_advance?: number
          price_cents?: number
          currency?: string
          schedule_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          event_type_id: string
          user_id: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          guest_notes: string | null
          start_time: string
          end_time: string
          timezone: string
          location: string | null
          meet_link: string | null
          status: string
          price_cents: number
          currency: string
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          google_calendar_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_type_id: string
          user_id: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          guest_notes?: string | null
          start_time: string
          end_time: string
          timezone: string
          location?: string | null
          meet_link?: string | null
          status?: string
          price_cents?: number
          currency?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          google_calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_type_id?: string
          user_id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          guest_notes?: string | null
          start_time?: string
          end_time?: string
          timezone?: string
          location?: string | null
          meet_link?: string | null
          status?: string
          price_cents?: number
          currency?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          google_calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
