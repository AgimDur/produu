import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Webhook-Secret aus Umgebungsvariablen
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || ''

// HMAC-Signatur prüfen
function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader || !SHOPIFY_WEBHOOK_SECRET) {
    console.error('HMAC-Header oder Webhook-Secret fehlt')
    return false
  }

  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(hmacHeader)
  )
}

// Bestellung aus Shopify-Daten verarbeiten
async function processOrder(orderData: any, topic: string) {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // Finde den entsprechenden Store
    const { data: stores } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('is_active', true)

    if (!stores || stores.length === 0) {
      console.error('Keine aktiven Shopify Stores gefunden')
      return
    }

    // Verwende den ersten aktiven Store (oder erweitere für mehrere Stores)
    const store = stores[0]

    const orderPayload = {
      shopify_order_id: orderData.id,
      shopify_store_id: store.id,
      order_number: orderData.order_number,
      customer_email: orderData.email,
      customer_first_name: orderData.customer?.first_name || null,
      customer_last_name: orderData.customer?.last_name || null,
      total_price: Math.round(parseFloat(orderData.total_price) * 100), // Convert to cents
      subtotal_price: Math.round(parseFloat(orderData.subtotal_price) * 100),
      total_tax: Math.round(parseFloat(orderData.total_tax) * 100),
      currency: orderData.currency,
      financial_status: orderData.financial_status,
      fulfillment_status: orderData.fulfillments?.length > 0 ? 'fulfilled' : 'unfulfilled',
      order_status: orderData.cancelled_at ? 'cancelled' : 'open',
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      tags: orderData.tags,
      note: orderData.note,
      processed_at: orderData.processed_at,
      cancelled_at: orderData.cancelled_at,
      cancelled_reason: orderData.cancel_reason,
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced' as const
    }

    // Prüfe ob Bestellung bereits existiert
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('shopify_order_id', orderData.id)
      .eq('shopify_store_id', store.id)
      .single()

    let orderId: string

    if (existingOrder) {
      // Update existing order
      if (topic === 'orders/cancelled') {
        // Bei Stornierung nur Status aktualisieren
        await supabase
          .from('orders')
          .update({
            order_status: 'cancelled',
            cancelled_at: orderData.cancelled_at,
            cancelled_reason: orderData.cancel_reason,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', existingOrder.id)
      } else {
        // Vollständiges Update
        await supabase
          .from('orders')
          .update(orderPayload)
          .eq('id', existingOrder.id)
      }
      orderId = existingOrder.id
    } else {
      // Create new order
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single()

      if (insertError) {
        console.error('Fehler beim Erstellen der Bestellung:', insertError)
        return
      }
      orderId = newOrder.id
    }

    // Verarbeite Bestellpositionen (nur bei create/update, nicht bei cancel)
    if (topic !== 'orders/cancelled' && orderData.line_items) {
      for (const lineItem of orderData.line_items) {
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
    }

    console.log(`Bestellung ${orderData.order_number} erfolgreich verarbeitet (${topic})`)
  } catch (error) {
    console.error('Fehler bei der Bestell-Verarbeitung:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Shopify sendet die Daten als Raw-Body
    const rawBody = await req.text()
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256')
    const topic = req.headers.get('x-shopify-topic')
    const shopDomain = req.headers.get('x-shopify-shop-domain')

    console.log('Shopify Webhook empfangen:', { topic, shopDomain })

    // HMAC-Signatur prüfen
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.error('Ungültige HMAC-Signatur')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Nur relevante Topics verarbeiten
    const relevantTopics = [
      'orders/create',
      'orders/updated', 
      'orders/cancelled',
      'orders/fulfilled',
      'orders/partially_fulfilled'
    ]

    if (!topic || !relevantTopics.includes(topic)) {
      console.log('Ignoriere nicht-relevantes Topic:', topic)
      return NextResponse.json({ ok: true })
    }

    // JSON parsen
    const orderData = JSON.parse(rawBody)

    // Bestellung verarbeiten
    await processOrder(orderData, topic)

    // Immer 200 zurückgeben, damit Shopify nicht erneut sendet
    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Fehler im Webhook-Handler:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 