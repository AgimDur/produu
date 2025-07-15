'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createShopifyStore } from '@/app/actions/shopify'

const storeSchema = z.object({
  store_name: z.string().min(1, 'Store Name ist erforderlich'),
  shopify_domain: z.string().min(1, 'Shopify Domain ist erforderlich'),
  access_token: z.string().min(1, 'Access Token ist erforderlich'),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  webhook_secret: z.string().optional(),
})

type StoreFormData = z.infer<typeof storeSchema>

export function ShopifyStoreForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_name: '',
      shopify_domain: '',
      access_token: '',
      api_key: '',
      api_secret: '',
      webhook_secret: '',
    },
  })

  const handleSubmit = async (data: StoreFormData) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createShopifyStore(data)
      setSuccess('Shopify Store erfolgreich hinzugefügt!')
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Store verbinden</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input
              id="store_name"
              {...form.register('store_name')}
              placeholder="Mein Shopify Store"
            />
            {form.formState.errors.store_name && (
              <p className="text-sm text-red-500">{form.formState.errors.store_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopify_domain">Shopify Domain *</Label>
            <Input
              id="shopify_domain"
              {...form.register('shopify_domain')}
              placeholder="mein-store.myshopify.com"
            />
            {form.formState.errors.shopify_domain && (
              <p className="text-sm text-red-500">{form.formState.errors.shopify_domain.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <Input
              id="access_token"
              type="password"
              {...form.register('access_token')}
              placeholder="shpat_..."
            />
            {form.formState.errors.access_token && (
              <p className="text-sm text-red-500">{form.formState.errors.access_token.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key (optional)</Label>
            <Input
              id="api_key"
              {...form.register('api_key')}
              placeholder="API Key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_secret">API Secret (optional)</Label>
            <Input
              id="api_secret"
              type="password"
              {...form.register('api_secret')}
              placeholder="API Secret"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Webhook Secret (optional)</Label>
            <Input
              id="webhook_secret"
              type="password"
              {...form.register('webhook_secret')}
              placeholder="Webhook Secret"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verbinde...' : 'Store verbinden'}
          </Button>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Wie bekomme ich meine Shopify API-Daten?</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Gehen Sie zu Ihrem Shopify Admin Panel</li>
            <li>2. Navigieren Sie zu Apps → App und Verkaufskanal entwickeln</li>
            <li>3. Erstellen Sie eine neue App oder verwenden Sie eine bestehende</li>
            <li>4. Gehen Sie zu API-Zugriffstoken und erstellen Sie einen neuen Token</li>
            <li>5. Kopieren Sie den Token und die Store-URL</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
} 