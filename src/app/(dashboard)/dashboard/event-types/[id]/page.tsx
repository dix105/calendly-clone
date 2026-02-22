'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

const COLORS = [
  '#0066FF', '#7C3AED', '#DC2626', '#059669', '#D97706', '#7C2D12', '#BE185D', '#4338CA'
]

export default function EditEventTypePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration_minutes: 30,
    color: COLORS[0],
    price_cents: 0,
    is_active: true,
  })

  useEffect(() => {
    loadEventType()
  }, [params.id])

  const loadEventType = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // First check if event exists
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      alert('Event type not found')
      router.push('/dashboard/event-types')
      return
    }

    // Check ownership
    if (data.user_id !== session.user.id) {
      alert('You do not have permission to edit this event type')
      router.push('/dashboard/event-types')
      return
    }

    setFormData({
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      duration_minutes: data.duration_minutes,
      color: data.color,
      price_cents: data.price_cents,
      is_active: data.is_active,
    })
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('event_types')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)

    setSaving(false)

    if (error) {
      alert('Error updating event type: ' + error.message)
      return
    }

    router.push('/dashboard/event-types')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    
    setDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setDeleting(false)
      return
    }

    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id)

    setDeleting(false)

    if (error) {
      alert('Error deleting event type: ' + error.message)
      return
    }

    router.push('/dashboard/event-types')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/event-types">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Event Type</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="30 Minute Meeting"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="30-minute-meeting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A quick 30-minute meeting to discuss..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={480}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.price_cents / 100}
                  onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active (visible on booking page)</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/event-types">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
