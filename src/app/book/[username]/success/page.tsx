import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar } from 'lucide-react'

export default function BookingSuccessPage({ 
  searchParams 
}: { 
  searchParams: { booking?: string; username?: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          
          <p className="text-muted-foreground">
            Your meeting has been scheduled. You will receive a confirmation email shortly.
          </p>

          {searchParams.booking && (
            <p className="text-sm text-muted-foreground mt-4">
              Booking ID: {searchParams.booking}
            </p>
          )}

          <div className="mt-8">
            <Link href={searchParams.username ? `/book/${searchParams.username}` : '/'} >
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Book another meeting
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
