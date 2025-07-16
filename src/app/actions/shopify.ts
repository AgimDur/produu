'use server'

import { revalidatePath } from 'next/cache'
import { ShopifyClient } from '@/lib/shopify'
import { getShopifyStores, saveShopifyStores, getProducts, getOrders, saveOrders } from '@/lib/kv'
import { 
  ShopifyStore, 
  CreateShopifyStoreData, 
  UpdateShopifyStoreData,
  SyncResult 
} from '@/types/shopify'

// Get all Shopify stores
export async function getShopifyStoresAction(): Promise<ShopifyStore[]> {
  try {
    const stores = await getShopifyStores()
    return stores as ShopifyStore[]
  } catch (error) {
    console.error('Error getting Shopify stores:', error)
    throw new Error('Fehler beim Laden der Shopify Stores')
  }
}

// Get a single Shopify store
export async function getShopifyStore(id: string): Promise<ShopifyStore | null> {
  try {
    const stores = await getShopifyStores() as ShopifyStore[]
    return stores.find(store => store.id === id) || null
  } catch (error) {
    console.error('Error getting Shopify store:', error)
    throw new Error('Fehler beim Laden des Shopify Stores')
  }
}

// Create a new Shopify store
export async function createShopifyStore(storeData: CreateShopifyStoreData): Promise<ShopifyStore> {
  try {
    const stores = await getShopifyStores() as ShopifyStore[]
    
    // Test the connection first
    const testStore: ShopifyStore = {
      id: 'temp',
      created_at: new Date().toISOString(),
      store_name: storeData.store_name,
      shopify_domain: storeData.shopify_domain,
      access_token: storeData.access_token,
      api_key: storeData.api_key,
      api_secret: storeData.api_secret,
      webhook_secret: storeData.webhook_secret,
      is_active: true,
      sync_status: 'idle'
    }

    const client = new ShopifyClient(testStore)
    const isConnected = await client.testConnection()

    if (!isConnected) {
      throw new Error('Verbindung zu Shopify Store konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Zugangsdaten.')
    }

    const newStore: ShopifyStore = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...storeData,
      is_active: true,
      sync_status: 'idle'
    }
    
    stores.push(newStore)
    await saveShopifyStores(stores)

    revalidatePath('/dashboard/settings')
    return newStore
  } catch (error) {
    console.error('Error creating Shopify store:', error)
    throw error
  }
}

// Update a Shopify store
export async function updateShopifyStore(id: string, storeData: UpdateShopifyStoreData): Promise<ShopifyStore> {
  try {
    const stores = await getShopifyStores() as ShopifyStore[]
    const storeIndex = stores.findIndex(store => store.id === id)
    
    if (storeIndex === -1) {
      throw new Error('Shopify Store nicht gefunden')
    }
    
    stores[storeIndex] = {
      ...stores[storeIndex],
      ...storeData,
    }
    
    await saveShopifyStores(stores)
    
    revalidatePath('/dashboard/settings')
    return stores[storeIndex]
  } catch (error) {
    console.error('Error updating Shopify store:', error)
    throw error
  }
}

// Delete a Shopify store
export async function deleteShopifyStore(id: string): Promise<void> {
  try {
    const stores = await getShopifyStores() as ShopifyStore[]
    const filteredStores = stores.filter(store => store.id !== id)
    
    await saveShopifyStores(filteredStores)
    
    revalidatePath('/dashboard/settings')
  } catch (error) {
    console.error('Error deleting Shopify store:', error)
    throw error
  }
}

// Sync products to Shopify
export async function syncProductsToShopify(storeId: string): Promise<SyncResult> {
  try {
    // Get the store
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    // Update sync status
    const stores = await getShopifyStores() as ShopifyStore[]
    const storeIndex = stores.findIndex(s => s.id === storeId)
    if (storeIndex !== -1) {
      stores[storeIndex].sync_status = 'syncing'
      stores[storeIndex].last_sync_at = new Date().toISOString()
      await saveShopifyStores(stores)
    }

    // Get all local products
    const products = await getProducts() as any[]

    // Initialize Shopify client
    const client = new ShopifyClient(store)
    
    // Sync products
    const result = await client.syncProductsToShopify(products)

    // Update sync status
    const syncStatus = result.success ? 'success' : 'error'
    if (storeIndex !== -1) {
      stores[storeIndex].sync_status = syncStatus
      stores[storeIndex].last_sync_at = new Date().toISOString()
      await saveShopifyStores(stores)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    
    return {
      success: result.success,
      message: result.message,
      synced_products: result.synced_products,
      errors: result.errors
    }
  } catch (error) {
    // Update sync status to error
    const stores = await getShopifyStores() as ShopifyStore[]
    const storeIndex = stores.findIndex(s => s.id === storeId)
    if (storeIndex !== -1) {
      stores[storeIndex].sync_status = 'error'
      stores[storeIndex].last_sync_at = new Date().toISOString()
      await saveShopifyStores(stores)
    }

    console.error('Sync failed:', error)
    return {
      success: false,
      message: `Sync fehlgeschlagen: ${error}`,
      synced_products: 0,
      errors: [error as string]
    }
  }
}

// Sync orders from Shopify
export async function syncOrdersFromShopify(storeId: string): Promise<SyncResult> {
  try {
    // Get the store
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    // Initialize Shopify client
    const client = new ShopifyClient(store)
    
    // Get all orders from Shopify
    const shopifyOrders = await client.getOrders(250, 'any')
    
    // Get existing orders
    const existingOrders = await getOrders() as any[]
    
    let syncedCount = 0
    const errors: string[] = []

    for (const shopifyOrder of shopifyOrders) {
      try {
        // Check if order already exists
        const existingOrder = existingOrders.find(order => 
          order.shopify_order_id === shopifyOrder.id && 
          order.shopify_store_id === storeId
        )

        if (!existingOrder) {
          // Create new order
          const newOrder = {
            id: crypto.randomUUID(),
            shopify_order_id: shopifyOrder.id,
            shopify_store_id: storeId,
            order_number: shopifyOrder.order_number,
            customer_email: shopifyOrder.email,
            customer_first_name: shopifyOrder.customer?.first_name || null,
            customer_last_name: shopifyOrder.customer?.last_name || null,
            total_price: Math.round(parseFloat(shopifyOrder.total_price) * 100),
            subtotal_price: Math.round(parseFloat(shopifyOrder.subtotal_price) * 100),
            total_tax: Math.round(parseFloat(shopifyOrder.total_tax) * 100),
            currency: shopifyOrder.currency,
            financial_status: shopifyOrder.financial_status,
            fulfillment_status: shopifyOrder.fulfillment_status || 'unfulfilled',
            order_status: shopifyOrder.cancelled_at ? 'cancelled' : 'open',
            shipping_address: shopifyOrder.shipping_address,
            billing_address: shopifyOrder.billing_address,
            tags: shopifyOrder.tags,
            note: shopifyOrder.note,
            processed_at: shopifyOrder.processed_at,
            cancelled_at: shopifyOrder.cancelled_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          existingOrders.push(newOrder)
          syncedCount++
        }
      } catch (error) {
        errors.push(`Order ${shopifyOrder.order_number}: ${error}`)
      }
    }

    // Save updated orders
    await saveOrders(existingOrders)

    revalidatePath('/dashboard/orders')
    
    return {
      success: errors.length === 0,
      message: `Synced ${syncedCount} orders from Shopify`,
      synced_orders: syncedCount,
      errors
    }
  } catch (error) {
    console.error('Order sync failed:', error)
    return {
      success: false,
      message: `Order sync fehlgeschlagen: ${error}`,
      synced_orders: 0,
      errors: [error as string]
    }
  }
} 