import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShopifyStoreForm } from '@/components/ShopifyStoreForm'
import { getShopifyStores, syncProductsToShopify, syncProductsFromShopify } from '@/app/actions/shopify'
import { getOrderStats } from '@/app/actions/orders'
import { Settings, Store, Package, ShoppingCart, RefreshCw } from 'lucide-react'

export default async function SettingsPage() {
  const stores = await getShopifyStores()
  const stats = await getOrderStats()

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
                        await syncProductsFromShopify(store.id)
                      }}>
                        <Button type="submit" variant="outline" size="sm" className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Produkte von Shopify
                        </Button>
                      </form>
                      
                      <form action={async () => {
                        'use server'
                        // TODO: Implement order sync from orders.ts
                        console.log('Order sync not yet implemented in settings')
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

          {/* Sync Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sync Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lokale Produkte</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    In lokaler Datenbank
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shopify Produkte</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    In Shopify Stores
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bestellungen</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_orders}</div>
                  <p className="text-xs text-muted-foreground">
                    Gesamt importiert
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 