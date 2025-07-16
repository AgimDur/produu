import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShopifyStoreForm } from '@/components/ShopifyStoreForm'
import { getShopifyStoresAction, syncProductsToShopify, syncOrdersFromShopify } from '@/app/actions/shopify'
import { Settings, Store, Package, ShoppingCart, RefreshCw } from 'lucide-react'

export default async function SettingsPage() {
  const stores = await getShopifyStoresAction()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Einstellungen</h1>
      </div>

      {/* Shopify Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shopify Integration
          </CardTitle>
          <CardDescription>
            Verbinden Sie Ihre Shopify Stores für Produkt- und Bestellungs-Synchronisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Store Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shopify Stores verwalten</h3>
            <ShopifyStoreForm />
          </div>

          {/* Connected Stores */}
          {stores.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Verbundene Stores</h3>
              <div className="grid gap-4">
                {stores.map((store) => (
                  <div key={store.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{store.store_name}</h4>
                        <p className="text-sm text-gray-600">{store.shopify_domain}</p>
                      </div>
                      <Badge variant={store.is_active ? "default" : "secondary"}>
                        {store.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <form action={async () => {
                        'use server'
                        await syncProductsToShopify(store.id)
                      }}>
                        <Button type="submit" variant="outline" size="sm" className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Produkte zu Shopify
                        </Button>
                      </form>
                      
                      <form action={async () => {
                        'use server'
                        await syncOrdersFromShopify(store.id)
                      }}>
                        <Button type="submit" variant="outline" size="sm" className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Bestellungen von Shopify
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <p className="font-medium">Shopify Integration</p>
              <p className="text-sm text-gray-500">{stores.length} Store(s) verbunden</p>
            </div>
            <Badge className={stores.length > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {stores.length > 0 ? "Aktiv" : "Nicht verbunden"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 