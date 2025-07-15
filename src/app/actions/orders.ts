'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { ShopifyClient } from '@/lib/shopify'
import { Order, OrderItem, SyncResult } from '@/types/order'
import { getShopifyStore } from './shopify'

// Get all orders
export async function getOrders(): Promise<Order[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Fehler beim Laden der Bestellungen: ${error.message}`)
  }

  return data || []
}

// Get orders for a specific store
export async function getOrdersByStore(storeId: string): Promise<Order[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('shopify_store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Fehler beim Laden der Bestellungen: ${error.message}`)
  }

  return data || []
}

// Get order items for an order
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Fehler beim Laden der Bestellpositionen: ${error.message}`)
  }

  return data || []
}

// Sync orders from Shopify to local database
export async function syncOrdersFromShopify(storeId: string): Promise<SyncResult> {
  const supabase = createServerComponentClient({ cookies })

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
    
    let syncedCount = 0
    const errors: string[] = []

    for (const shopifyOrder of shopifyOrders) {
      try {
        // Check if order already exists
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('shopify_order_id', shopifyOrder.id)
          .eq('shopify_store_id', storeId)
          .single()

        const orderData = {
          shopify_order_id: shopifyOrder.id,
          shopify_store_id: storeId,
          order_number: shopifyOrder.order_number,
          customer_email: shopifyOrder.email,
          customer_first_name: shopifyOrder.customer?.first_name,
          customer_last_name: shopifyOrder.customer?.last_name,
          total_price: Math.round(parseFloat(shopifyOrder.total_price) * 100), // Convert to cents
          subtotal_price: Math.round(parseFloat(shopifyOrder.subtotal_price) * 100),
          total_tax: Math.round(parseFloat(shopifyOrder.total_tax) * 100),
          currency: shopifyOrder.currency,
          financial_status: shopifyOrder.financial_status,
          fulfillment_status: shopifyOrder.fulfillments?.length > 0 ? 'fulfilled' : 'unfulfilled',
          order_status: shopifyOrder.cancelled_at ? 'cancelled' : 'open',
          shipping_address: shopifyOrder.shipping_address,
          billing_address: shopifyOrder.billing_address,
          tags: shopifyOrder.tags,
          note: shopifyOrder.note,
          processed_at: shopifyOrder.processed_at,
          cancelled_at: shopifyOrder.cancelled_at,
          cancelled_reason: shopifyOrder.cancel_reason,
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced' as const
        }

        let orderId: string

        if (existingOrder) {
          // Update existing order
          const { error: updateError } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', existingOrder.id)

          if (updateError) {
            errors.push(`Fehler beim Aktualisieren von Bestellung ${shopifyOrder.order_number}: ${updateError.message}`)
            continue
          }
          orderId = existingOrder.id
        } else {
          // Create new order
          const { data: newOrder, error: insertError } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single()

          if (insertError) {
            errors.push(`Fehler beim Erstellen von Bestellung ${shopifyOrder.order_number}: ${insertError.message}`)
            continue
          }
          orderId = newOrder.id
        }

        // Sync order items
        for (const lineItem of shopifyOrder.line_items) {
          try {
            // Check if order item already exists
            const { data: existingItem } = await supabase
              .from('order_items')
              .select('*')
              .eq('shopify_line_item_id', lineItem.id)
              .eq('order_id', orderId)
              .single()

            // Find local product by SKU
            const { data: localProduct } = await supabase
              .from('products')
              .select('*')
              .eq('sku', lineItem.sku)
              .single()

            const itemData = {
              order_id: orderId,
              shopify_line_item_id: lineItem.id,
              product_id: localProduct?.id,
              shopify_product_id: lineItem.product_id,
              shopify_variant_id: lineItem.variant_id,
              sku: lineItem.sku,
              title: lineItem.title,
              variant_title: lineItem.variant_title,
              quantity: lineItem.quantity,
              price: Math.round(parseFloat(lineItem.price) * 100), // Convert to cents
              total_discount: Math.round(parseFloat(lineItem.total_discount) * 100),
              fulfillment_status: lineItem.fulfillment_status || 'unfulfilled',
              requires_shipping: lineItem.requires_shipping,
              taxable: lineItem.taxable,
              gift_card: lineItem.gift_card
            }

            if (existingItem) {
              // Update existing item
              await supabase
                .from('order_items')
                .update(itemData)
                .eq('id', existingItem.id)
            } else {
              // Create new item
              await supabase
                .from('order_items')
                .insert([itemData])
            }
          } catch (itemError) {
            console.error(`Fehler bei Bestellposition ${lineItem.title}:`, itemError)
          }
        }

        syncedCount++
      } catch (error) {
        const errorMessage = `Fehler bei Bestellung ${shopifyOrder.order_number}: ${error}`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/orders')
    
    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Erfolgreich ${syncedCount} Bestellungen von Shopify importiert`
        : `${syncedCount} Bestellungen importiert, ${errors.length} Fehler`,
      synced_orders: syncedCount,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    console.error('Sync orders from Shopify failed:', error)
    return {
      success: false,
      message: `Import fehlgeschlagen: ${error}`,
      synced_orders: 0,
      errors: [error as string]
    }
  }
}

// Get order statistics
export async function getOrderStats(): Promise<{
  total_orders: number
  total_revenue: number
  pending_orders: number
  fulfilled_orders: number
}> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_price, order_status, fulfillment_status')

  if (error) {
    throw new Error(`Fehler beim Laden der Bestellstatistiken: ${error.message}`)
  }

  const total_orders = orders?.length || 0
  const total_revenue = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0
  const pending_orders = orders?.filter(order => order.fulfillment_status === 'unfulfilled').length || 0
  const fulfilled_orders = orders?.filter(order => order.fulfillment_status === 'fulfilled').length || 0

  return {
    total_orders,
    total_revenue,
    pending_orders,
    fulfilled_orders
  }
} 