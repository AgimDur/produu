import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
      </div>

      <div className="grid gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Aktuelle Konfiguration und Status der Anwendung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Datenbank</p>
                <p className="text-sm text-gray-500">Vercel KV (Redis)</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Management</p>
                <p className="text-sm text-gray-500">Clerk</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Deployment</p>
                <p className="text-sm text-gray-500">Vercel</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Umgebungsvariablen</CardTitle>
            <CardDescription>
              Status der erforderlichen Konfigurationsvariablen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clerk Publishable Key</p>
                <p className="text-sm text-gray-500">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Gesetzt</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clerk Secret Key</p>
                <p className="text-sm text-gray-500">CLERK_SECRET_KEY</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Gesetzt</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Vercel KV</p>
                <p className="text-sm text-gray-500">Automatisch konfiguriert</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>Anwendungsinformationen</CardTitle>
            <CardDescription>
              Details über die aktuelle Version und Konfiguration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Framework</p>
                <p className="text-sm">Next.js 15.3.5</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Datenbank</p>
                <p className="text-sm">Vercel KV (Redis)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Authentication</p>
                <p className="text-sm">Clerk</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Deployment</p>
                <p className="text-sm">Vercel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aktionen</CardTitle>
            <CardDescription>
              Verfügbare Systemaktionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" disabled>
                Datenbank zurücksetzen
              </Button>
              <Button variant="outline" disabled>
                Cache leeren
              </Button>
              <Button variant="outline" disabled>
                Logs anzeigen
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Diese Funktionen sind in der aktuellen Version noch nicht verfügbar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 