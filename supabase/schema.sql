-- Calendly Clone Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
alter table if exists public.users enable row level security;

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Calendar connections
create table if not exists public.calendars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null default 'google', -- 'google', 'outlook', etc.
  provider_account_id text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, provider_account_id)
);

-- Weekly availability schedule
create table if not exists public.availability_schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text default 'Default',
  timezone text default 'UTC',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily availability slots (Mon=0, Sun=6)
create table if not exists public.availability_slots (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references public.availability_schedules(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Date overrides (specific dates off or different hours)
create table if not exists public.date_overrides (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references public.availability_schedules(id) on delete cascade not null,
  date date not null,
  is_unavailable boolean default false,
  start_time time,
  end_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(schedule_id, date)
);

-- Event types (meeting templates)
create table if not exists public.event_types (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  duration_minutes integer not null default 30,
  location_type text default 'google_meet', -- 'google_meet', 'zoom', 'phone', 'in_person'
  location_details text,
  color text default '#0066FF',
  is_active boolean default true,
  buffer_minutes_before integer default 0,
  buffer_minutes_after integer default 0,
  max_bookings_per_day integer,
  min_notice_hours integer default 24,
  max_days_in_advance integer default 30,
  price_cents integer default 0, -- 0 = free
  currency text default 'usd',
  schedule_id uuid references public.availability_schedules(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, slug)
);

-- Bookings
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  event_type_id uuid references public.event_types(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Guest info
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  guest_notes text,
  
  -- Meeting details
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  timezone text not null,
  location text,
  meet_link text,
  
  -- Status
  status text default 'confirmed' check (status in ('confirmed', 'cancelled', 'rescheduled', 'no_show')),
  
  -- Payment
  price_cents integer default 0,
  currency text default 'usd',
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  
  -- Google Calendar
  google_calendar_event_id text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Profiles: Users can read all profiles, update only their own
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Calendars: Users can only see their own
create policy "Users can view own calendars" on public.calendars
  for select using (auth.uid() = user_id);

create policy "Users can insert own calendars" on public.calendars
  for insert with check (auth.uid() = user_id);

create policy "Users can update own calendars" on public.calendars
  for update using (auth.uid() = user_id);

create policy "Users can delete own calendars" on public.calendars
  for delete using (auth.uid() = user_id);

-- Availability schedules: Users can only see their own
create policy "Users can view own schedules" on public.availability_schedules
  for select using (auth.uid() = user_id);

create policy "Users can manage own schedules" on public.availability_schedules
  for all using (auth.uid() = user_id);

-- Availability slots
create policy "Users can view own slots" on public.availability_slots
  for select using (
    schedule_id in (select id from public.availability_schedules where user_id = auth.uid())
  );

create policy "Users can manage own slots" on public.availability_slots
  for all using (
    schedule_id in (select id from public.availability_schedules where user_id = auth.uid())
  );

-- Date overrides
create policy "Users can view own overrides" on public.date_overrides
  for select using (
    schedule_id in (select id from public.availability_schedules where user_id = auth.uid())
  );

create policy "Users can manage own overrides" on public.date_overrides
  for all using (
    schedule_id in (select id from public.availability_schedules where user_id = auth.uid())
  );

-- Event types: Public can view active ones, owners can manage all
create policy "Public can view active event types" on public.event_types
  for select using (is_active = true);

create policy "Users can manage own event types" on public.event_types
  for all using (auth.uid() = user_id);

-- Bookings: Hosts and guests can view
create policy "Hosts can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Guests can view bookings by email" on public.bookings
  for select using (guest_email = auth.email());

create policy "System can insert bookings" on public.bookings
  for insert with check (true);

create policy "Hosts can update own bookings" on public.bookings
  for update using (auth.uid() = user_id);

-- Functions for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger on_profile_updated before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_calendar_updated before update on public.calendars
  for each row execute procedure public.handle_updated_at();

create trigger on_schedule_updated before update on public.availability_schedules
  for each row execute procedure public.handle_updated_at();

create trigger on_event_type_updated before update on public.event_types
  for each row execute procedure public.handle_updated_at();

create trigger on_booking_updated before update on public.bookings
  for each row execute procedure public.handle_updated_at();
