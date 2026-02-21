import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock } from 'lucide-react'

export default async function PublicBookingPage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get user by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get user's active event types
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', (profile as any).id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const userInitials = ((profile as any).full_name || (profile as any).username || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{(profile as any).full_name || (profile as any).username}</h1>
                <p className="text-muted-foreground">Book a meeting with me</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Select an event type</h2>

            <div className="space-y-3">
              {(eventTypes as any[])?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No public events available
                </p>
              ) : (
                (eventTypes as any[])?.map((event: any) => (
                  <Link 
                    key={event.id} 
                    href={`/book/${params.username}/${event.slug}`}
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.duration_minutes} min
                        </span>
                        {event.price_cents > 0 && (
                          <span className="font-medium">${event.price_cents / 100}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
