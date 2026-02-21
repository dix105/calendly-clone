import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ExternalLink, Settings } from 'lucide-react'

export default async function EventTypesPage() {
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
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Types</h1>
          <p className="text-muted-foreground">Create and manage your meeting types</p>
        </div>
        <Link href="/dashboard/event-types/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event Type
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(eventTypes as any[])?.map((event: any) => (
          <Card key={event.id} className={event.is_active ? '' : 'opacity-60'}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: event.color }}
                  />
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </div>
                <Link href={`/dashboard/event-types/${event.id}`}>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description || 'No description'}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{event.duration_minutes} minutes</span>
                <span className="font-medium">
                  {event.price_cents > 0 ? `$${event.price_cents / 100}` : 'Free'}
                </span>
              </div>

              {profile && (
                <Link 
                  href={`/book/${(profile as any).username}/${event.slug}`}
                  target="_blank"
                  className="block"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Preview
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
