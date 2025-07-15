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

// Sync products from Shopify to local database
export async function syncProductsFromShopify(storeId: string): Promise<SyncResult> {
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

    // Initialize Shopify client
    const client = new ShopifyClient(store)
    
    // Get all products from Shopify
    const shopifyProducts = await client.getProducts()
    
    let syncedCount = 0
    const errors: string[] = []

    for (const shopifyProduct of shopifyProducts) {
      try {
        // Get the first variant (main product)
        const variant = shopifyProduct.variants[0]
        if (!variant) continue

        // Check if product already exists by SKU
        const { data: existingProduct } = await supabase
          .from('products')
          .select('*')
          .eq('sku', variant.sku)
          .single()

        const productData = {
          name: shopifyProduct.title,
          sku: variant.sku,
          ean13: variant.barcode || undefined,
          description: shopifyProduct.body_html || undefined,
          price: Math.round(parseFloat(variant.price) * 100), // Convert to cents
          stock: variant.inventory_quantity || 0,
          category: shopifyProduct.product_type || 'Uncategorized',
          sku_level: 'grandparent' as const, // Default to grandparent for imported products
          parent_id: null
        }

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)

          if (updateError) {
            errors.push(`Fehler beim Aktualisieren von ${variant.sku}: ${updateError.message}`)
          } else {
            syncedCount++
          }
        } else {
          // Create new product
          const { error: insertError } = await supabase
            .from('products')
            .insert([productData])

          if (insertError) {
            errors.push(`Fehler beim Erstellen von ${variant.sku}: ${insertError.message}`)
          } else {
            syncedCount++
          }
        }

        // Update or create shopify_products mapping
        const mappingData = {
          shopify_product_id: shopifyProduct.id,
          shopify_variant_id: variant.id,
          shopify_store_id: storeId,
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced'
        }

        if (existingProduct) {
          await supabase
            .from('shopify_products')
            .upsert([{
              local_product_id: existingProduct.id,
              ...mappingData
            }])
        }

      } catch (error) {
        const errorMessage = `Fehler bei Produkt ${shopifyProduct.title}: ${error}`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    // Update sync status
    const syncStatus = errors.length === 0 ? 'success' : 'error'
    await supabase
      .from('shopify_stores')
      .update({ 
        sync_status: syncStatus, 
        last_sync_at: new Date().toISOString() 
      })
      .eq('id', storeId)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/shopify')
    
    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Erfolgreich ${syncedCount} Produkte von Shopify importiert`
        : `${syncedCount} Produkte importiert, ${errors.length} Fehler`,
      synced_products: syncedCount,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    // Update sync status to error
    await supabase
      .from('shopify_stores')
      .update({ 
        sync_status: 'error', 
        last_sync_at: new Date().toISOString() 
      })
      .eq('id', storeId)

    console.error('Sync from Shopify failed:', error)
    return {
      success: false,
      message: `Import fehlgeschlagen: ${error}`,
      synced_products: 0,
      errors: [error as string]
    }
  }
} 

// Register Shopify webhooks for automatic order sync
export async function registerShopifyWebhooks(storeId: string): Promise<boolean> {
  try {
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    const client = new ShopifyClient(store)
    
    // Webhook-URL (deine Vercel-Domain)
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/api/shopify-webhook`
    
    // Webhook-Topics für Bestellungen
    const webhookTopics = [
      'orders/create',
      'orders/updated',
      'orders/cancelled',
      'orders/fulfilled',
      'orders/partially_fulfilled'
    ]

    let successCount = 0

    for (const topic of webhookTopics) {
      try {
        // Prüfe ob Webhook bereits existiert
        const existingWebhooks = await client.getWebhooks()
        const existingWebhook = existingWebhooks.find(wh => 
          wh.topic === topic && wh.address === webhookUrl
        )

        if (existingWebhook) {
          console.log(`Webhook für ${topic} bereits registriert`)
          successCount++
          continue
        }

        // Erstelle neuen Webhook
        const webhookData = {
          topic: topic,
          address: webhookUrl,
          format: 'json'
        }

        const result = await client.createWebhook(webhookData)
        
        if (result) {
          console.log(`Webhook für ${topic} erfolgreich registriert`)
          successCount++
        } else {
          console.error(`Fehler beim Registrieren des Webhooks für ${topic}`)
        }
      } catch (error) {
        console.error(`Fehler beim Registrieren des Webhooks für ${topic}:`, error)
      }
    }

    console.log(`${successCount}/${webhookTopics.length} Webhooks erfolgreich registriert`)
    return successCount === webhookTopics.length

  } catch (error) {
    console.error('Fehler beim Registrieren der Webhooks:', error)
    return false
  }
}

// Delete all webhooks for a store
export async function deleteShopifyWebhooks(storeId: string): Promise<boolean> {
  try {
    const store = await getShopifyStore(storeId)
    if (!store) {
      throw new Error('Shopify Store nicht gefunden')
    }

    const client = new ShopifyClient(store)
    const webhooks = await client.getWebhooks()
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/api/shopify-webhook`
    
    let deletedCount = 0
    
    for (const webhook of webhooks) {
      if (webhook.address === webhookUrl) {
        try {
          await client.deleteWebhook(webhook.id)
          console.log(`Webhook ${webhook.topic} gelöscht`)
          deletedCount++
        } catch (error) {
          console.error(`Fehler beim Löschen des Webhooks ${webhook.topic}:`, error)
        }
      }
    }

    console.log(`${deletedCount} Webhooks gelöscht`)
    return true

  } catch (error) {
    console.error('Fehler beim Löschen der Webhooks:', error)
    return false
  }
} 