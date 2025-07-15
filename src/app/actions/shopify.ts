'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { ShopifyClient } from '@/lib/shopify'
import { 
  ShopifyStore, 
  CreateShopifyStoreData, 
  UpdateShopifyStoreData,
  SyncResult 
} from '@/types/shopify'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Product } from '@/types/product'

// Get all Shopify stores
export async function getShopifyStores(): Promise<ShopifyStore[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('shopify_stores')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Fehler beim Laden der Shopify Stores: ${error.message}`)
  }

  return data || []
}

// Get a single Shopify store
export async function getShopifyStore(id: string): Promise<ShopifyStore | null> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('shopify_stores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Fehler beim Laden des Shopify Stores: ${error.message}`)
  }

  return data
}

// Create a new Shopify store
export async function createShopifyStore(storeData: CreateShopifyStoreData): Promise<ShopifyStore> {
  const supabase = createServerComponentClient({ cookies })
  
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

  const { data, error } = await supabase
    .from('shopify_stores')
    .insert([storeData])
    .select()
    .single()

  if (error) {
    throw new Error(`Fehler beim Erstellen des Shopify Stores: ${error.message}`)
  }

  revalidatePath('/dashboard/shopify')
  return data
}

// Update a Shopify store
export async function updateShopifyStore(storeData: UpdateShopifyStoreData): Promise<ShopifyStore> {
  const supabase = createServerComponentClient({ cookies })
  const { id, ...updateData } = storeData

  // Test the connection if credentials are being updated
  if (updateData.access_token) {
    const existingStore = await getShopifyStore(id)
    if (existingStore) {
      const testStore: ShopifyStore = {
        ...existingStore,
        ...updateData
      }
      const client = new ShopifyClient(testStore)
      const isConnected = await client.testConnection()

      if (!isConnected) {
        throw new Error('Verbindung zu Shopify Store konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Zugangsdaten.')
      }
    }
  }

  const { data, error } = await supabase
    .from('shopify_stores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Shopify Stores: ${error.message}`)
  }

  revalidatePath('/dashboard/shopify')
  return data
}

// Delete a Shopify store
export async function deleteShopifyStore(id: string): Promise<void> {
  const supabase = createServerComponentClient({ cookies })
  const { error } = await supabase
    .from('shopify_stores')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Fehler beim Löschen des Shopify Stores: ${error.message}`)
  }

  revalidatePath('/dashboard/shopify')
}

// Test connection to a Shopify store
export async function testShopifyConnection(storeId: string): Promise<boolean> {
  try {
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Store nicht gefunden')
    }

    const client = new ShopifyClient(store)
    return await client.testConnection()
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}

// Sync products to Shopify
export async function syncProductsToShopify(storeId: string): Promise<SyncResult> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get the store
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    // Update sync status
    await supabase
      .from('shopify_stores')
      .update({ sync_status: 'syncing', last_sync_at: new Date().toISOString() })
      .eq('id', storeId)

    // Get all local products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (productsError) {
      throw new Error(`Fehler beim Laden der Produkte: ${productsError.message}`)
    }

    // Initialize Shopify client
    const client = new ShopifyClient(store)
    
    // Sync products
    const result = await client.syncProductsToShopify(products || [])

    // Update sync status
    const syncStatus = result.success ? 'success' : 'error'
    await supabase
      .from('shopify_stores')
      .update({ 
        sync_status: syncStatus, 
        last_sync_at: new Date().toISOString() 
      })
      .eq('id', storeId)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/shopify')
    
    return result
  } catch (error) {
    // Update sync status to error
    await supabase
      .from('shopify_stores')
      .update({ 
        sync_status: 'error', 
        last_sync_at: new Date().toISOString() 
      })
      .eq('id', storeId)

    console.error('Sync failed:', error)
    return {
      success: false,
      message: `Sync fehlgeschlagen: ${error}`,
      synced_products: 0,
      errors: [error as string]
    }
  }
}

// Get Shopify products for a store
export async function getShopifyProducts(storeId: string) {
  try {
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    const client = new ShopifyClient(store)
    return await client.getProducts()
  } catch (error) {
    console.error('Failed to get Shopify products:', error)
    throw error
  }
}

// Get shop information
export async function getShopInfo(storeId: string) {
  try {
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    const client = new ShopifyClient(store)
    return await client.getShopInfo()
  } catch (error) {
    console.error('Failed to get shop info:', error)
    throw error
  }
} 