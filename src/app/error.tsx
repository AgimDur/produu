'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Ein Fehler ist aufgetreten</CardTitle>
          <CardDescription>
            Es gab ein Problem beim Laden der Anwendung. Bitte versuchen Sie es erneut.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Fehler:</strong> {error.message}</p>
            {error.digest && (
              <p><strong>Fehler-ID:</strong> {error.digest}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button onClick={reset} className="flex-1">
              Erneut versuchen
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Zur Startseite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 