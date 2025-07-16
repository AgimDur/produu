'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createShopifyStore } from '@/app/actions/shopify'
import { CreateShopifyStoreData } from '@/types/shopify'

export function ShopifyStoreForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<CreateShopifyStoreData>({
    defaultValues: {
      store_name: '',
      shopify_domain: '',
      access_token: '',
      api_key: '',
      api_secret: '',
      webhook_secret: ''
    }
  })

  const onSubmit = async (data: CreateShopifyStoreData) => {
    setLoading(true)
    setError('')

    try {
      await createShopifyStore(data)
      setOpen(false)
      form.reset()
      // Refresh the page to show the new store
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Shopify Store hinzufügen</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuer Shopify Store</DialogTitle>
          <DialogDescription>
            Fügen Sie einen neuen Shopify Store hinzu, um Produkte und Bestellungen zu synchronisieren.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input 
              id="store_name" 
              {...form.register('store_name', { required: true })} 
              placeholder="Mein Shopify Store"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopify_domain">Shopify Domain</Label>
            <Input 
              id="shopify_domain" 
              {...form.register('shopify_domain', { required: true })} 
              placeholder="mein-store.myshopify.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input 
              id="access_token" 
              type="password"
              {...form.register('access_token', { required: true })} 
              placeholder="shpat_..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input 
              id="api_key" 
              {...form.register('api_key', { required: true })} 
              placeholder="API Key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_secret">API Secret</Label>
            <Input 
              id="api_secret" 
              type="password"
              {...form.register('api_secret', { required: true })} 
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
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Erstellen...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 