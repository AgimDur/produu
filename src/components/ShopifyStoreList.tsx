'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink 
} from 'lucide-react'
import { ShopifyStore } from '@/types/shopify'
import { 
  deleteShopifyStore, 
  testShopifyConnection, 
  syncProductsToShopify,
  syncProductsFromShopify
} from '@/app/actions/shopify'
import { syncOrdersFromShopify } from '@/app/actions/orders'

interface ShopifyStoreListProps {
  stores: ShopifyStore[]
}

export function ShopifyStoreList({ stores }: ShopifyStoreListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleTestConnection = async (storeId: string) => {
    setLoadingStates(prev => ({ ...prev, [`test-${storeId}`]: true }))
    setError('')
    setSuccess('')

    try {
      const isConnected = await testShopifyConnection(storeId)
      if (isConnected) {
        setSuccess('Verbindung erfolgreich!')
      } else {
        setError('Verbindung fehlgeschlagen. Überprüfen Sie Ihre Zugangsdaten.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`test-${storeId}`]: false }))
    }
  }

  const handleSyncToShopify = async (storeId: string) => {
    setLoadingStates(prev => ({ ...prev, [`sync-to-${storeId}`]: true }))
    setError('')
    setSuccess('')

    try {
      const result = await syncProductsToShopify(storeId)
      if (result.success) {
        setSuccess(`${result.message} - ${result.synced_products} Produkte zu Shopify synchronisiert`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`sync-to-${storeId}`]: false }))
    }
  }

  const handleSyncFromShopify = async (storeId: string) => {
    setLoadingStates(prev => ({ ...prev, [`sync-from-${storeId}`]: true }))
    setError('')
    setSuccess('')

    try {
      const result = await syncProductsFromShopify(storeId)
      if (result.success) {
        setSuccess(`${result.message} - ${result.synced_products} Produkte von Shopify importiert`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`sync-from-${storeId}`]: false }))
    }
  }

  const handleSyncOrdersFromShopify = async (storeId: string) => {
    setLoadingStates(prev => ({ ...prev, [`sync-orders-${storeId}`]: true }))
    setError('')
    setSuccess('')

    try {
      const result = await syncOrdersFromShopify(storeId)
      if (result.success) {
        setSuccess(`${result.message} - ${result.synced_orders} Bestellungen von Shopify importiert`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`sync-orders-${storeId}`]: false }))
    }
  }

  const handleDelete = async (storeId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Store löschen möchten?')) {
      return
    }

    setLoadingStates(prev => ({ ...prev, [`delete-${storeId}`]: true }))
    setError('')
    setSuccess('')

    try {
      await deleteShopifyStore(storeId)
      setSuccess('Store erfolgreich gelöscht!')
      // Refresh the page to update the list
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`delete-${storeId}`]: false }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'syncing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (stores.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>Keine Shopify Stores verbunden</p>
            <p className="text-sm">Fügen Sie Ihren ersten Store hinzu</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
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

      {stores.map((store) => (
        <Card key={store.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {store.store_name}
                  {getStatusIcon(store.sync_status)}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {store.shopify_domain}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(store.sync_status)}>
                  {store.sync_status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${store.shopify_domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {store.last_sync_at && (
                <p className="text-sm text-gray-600">
                  Letzte Synchronisation: {new Date(store.last_sync_at).toLocaleString('de-DE')}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(store.id)}
                  disabled={loadingStates[`test-${store.id}`]}
                >
                  {loadingStates[`test-${store.id}`] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verbindung testen'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncToShopify(store.id)}
                  disabled={loadingStates[`sync-to-${store.id}`]}
                >
                  {loadingStates[`sync-to-${store.id}`] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    '→ Shopify'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncFromShopify(store.id)}
                  disabled={loadingStates[`sync-from-${store.id}`]}
                >
                  {loadingStates[`sync-from-${store.id}`] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    '← Produkte'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncOrdersFromShopify(store.id)}
                  disabled={loadingStates[`sync-orders-${store.id}`]}
                >
                  {loadingStates[`sync-orders-${store.id}`] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    '← Bestellungen'
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(store.id)}
                  disabled={loadingStates[`delete-${store.id}`]}
                >
                  {loadingStates[`delete-${store.id}`] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 