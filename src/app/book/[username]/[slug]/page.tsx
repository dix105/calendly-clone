'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format, addMinutes } from 'date-fns'

export default function EventBookingPage({ 
  params 
}: { 
  params: { username: string; slug: string } 
}) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [eventType, setEventType] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedDate && eventType) {
      generateTimeSlots(selectedDate)
    }
  }, [selectedDate, eventType])

  const loadData = async () => {
    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', params.username)
      .single()

    if (!profileData) {
      router.push('/404')
      return
    }

    setProfile(profileData)

    // Get event type
    const { data: eventData } = await supabase
      .from('event_types')
      .select('*, availability_schedules(*)')
      .eq('user_id', profileData.id)
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (!eventData) {
      router.push('/404')
      return
    }

    setEventType(eventData)
    setLoading(false)
  }

  const generateTimeSlots = async (date: Date) => {
    // This is a simplified version - in production, you'd fetch from Google Calendar API
    // and check against the user's availability schedule
    
    const slots: string[] = []
    const startHour = 9
    const endHour = 17
    const duration = eventType?.duration_minutes || 30

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }

    setAvailableSlots(slots)
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !eventType) return

    setSubmitting(true)

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startTime = new Date(selectedDate)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = addMinutes(startTime, eventType.duration_minutes)

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_type_id: eventType.id,
        user_id: eventType.user_id,
        guest_name: formData.name,
        guest_email: formData.email,
        guest_notes: formData.notes,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        price_cents: eventType.price_cents,
        currency: eventType.currency,
        payment_status: eventType.price_cents > 0 ? 'pending' : 'paid',
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      alert('Error creating booking: ' + error.message)
      return
    }

    // If paid event, redirect to Stripe
    if (eventType.price_cents > 0) {
      // TODO: Implement Stripe checkout
      alert('Payment integration coming soon! Booking created as pending.')
    }

    router.push(`/book/${params.username}/success?booking=${data.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const userInitials = (profile?.full_name || profile?.username || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/book/${params.username}`} className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to events
        </Link>

        <Card>
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">{profile?.full_name || profile?.username}</p>
                <h1 className="text-xl font-bold">{eventType?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {eventType?.duration_minutes} min
                  </span>
                  {eventType?.price_cents > 0 && (
                    <span className="font-medium">${eventType.price_cents / 100}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <Label className="mb-3 block">Select a date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              <div>
                {selectedDate ? (
                  <>
                    <Label className="mb-3 block">
                      Available times for {format(selectedDate, 'MMMM d, yyyy')}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          className="justify-center"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a date to see available times</p>
                )}
              </div>
            </div>

            {/* Booking Form */}
            {selectedTime && (
              <form onSubmit={handleBooking} className="mt-8 pt-8 border-t space-y-4">
                <h3 className="font-semibold">Enter your details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anything you'd like to discuss..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {eventType?.price_cents > 0 
                    ? `Continue to Payment ($${eventType.price_cents / 100})`
                    : 'Confirm Booking'
                  }
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
