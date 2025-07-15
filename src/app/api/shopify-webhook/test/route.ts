import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Test webhook functionality with simulated order data
export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Test Webhook empfangen - Simuliere Bestellung...')

    // Simulierte Shopify-Bestellung (wie sie von Shopify kommen würde)
    const testOrderData = {
      id: 123456789,
      order_number: "TEST-ORDER-001",
      email: "test@example.com",
      customer: {
        first_name: "Test",
        last_name: "Kunde"
      },
      total_price: "99.99",
      subtotal_price: "89.99",
      total_tax: "10.00",
      currency: "EUR",
      financial_status: "paid",
      fulfillment_status: "unfulfilled",
      cancelled_at: null,
      cancel_reason: null,
      processed_at: new Date().toISOString(),
      tags: "test,webhook",
      note: "Test-Bestellung via Webhook",
      shipping_address: {
        first_name: "Test",
        last_name: "Kunde",
        address1: "Teststraße 123",
        city: "Teststadt",
        country: "Deutschland",
        zip: "12345"
      },
      billing_address: {
        first_name: "Test",
        last_name: "Kunde",
        address1: "Teststraße 123",
        city: "Teststadt",
        country: "Deutschland",
        zip: "12345"
      },
      line_items: [
        {
          id: 987654321,
          product_id: 12345,
          variant_id: 67890,
          sku: "TEST-SKU-001",
          title: "Test Produkt",
          variant_title: "Standard",
          quantity: 2,
          price: "44.99",
          total_discount: "0.00",
          fulfillment_status: "unfulfilled",
          requires_shipping: true,
          taxable: true,
          gift_card: false
        }
      ]
    }

    const supabase = createServerComponentClient({ cookies })
    
    // Finde den entsprechenden Store
    const { data: stores } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('is_active', true)

    if (!stores || stores.length === 0) {
      console.error('❌ Keine aktiven Shopify Stores gefunden')
      return NextResponse.json({ 
        success: false, 
        error: 'Keine aktiven Shopify Stores gefunden' 
      }, { status: 400 })
    }

    const store = stores[0]
    console.log(`✅ Store gefunden: ${store.store_name}`)

    const orderPayload = {
      shopify_order_id: testOrderData.id,
      shopify_store_id: store.id,
      order_number: testOrderData.order_number,
      customer_email: testOrderData.email,
      customer_first_name: testOrderData.customer?.first_name || null,
      customer_last_name: testOrderData.customer?.last_name || null,
      total_price: Math.round(parseFloat(testOrderData.total_price) * 100),
      subtotal_price: Math.round(parseFloat(testOrderData.subtotal_price) * 100),
      total_tax: Math.round(parseFloat(testOrderData.total_tax) * 100),
      currency: testOrderData.currency,
      financial_status: testOrderData.financial_status,
      fulfillment_status: testOrderData.fulfillment_status,
      order_status: testOrderData.cancelled_at ? 'cancelled' : 'open',
      shipping_address: testOrderData.shipping_address,
      billing_address: testOrderData.billing_address,
      tags: testOrderData.tags,
      note: testOrderData.note,
      processed_at: testOrderData.processed_at,
      cancelled_at: testOrderData.cancelled_at,
      cancelled_reason: testOrderData.cancel_reason,
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced' as const
    }

    // Prüfe ob Test-Bestellung bereits existiert
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('shopify_order_id', testOrderData.id)
      .eq('shopify_store_id', store.id)
      .single()

    let orderId: string

    if (existingOrder) {
      console.log('🔄 Test-Bestellung existiert bereits - Update...')
      await supabase
        .from('orders')
        .update(orderPayload)
        .eq('id', existingOrder.id)
      orderId = existingOrder.id
    } else {
      console.log('➕ Erstelle neue Test-Bestellung...')
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Fehler beim Erstellen der Test-Bestellung:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: `Fehler beim Erstellen: ${insertError.message}` 
        }, { status: 500 })
      }
      orderId = newOrder.id
    }

    // Verarbeite Test-Bestellpositionen
    for (const lineItem of testOrderData.line_items) {
      try {
        const { data: existingItem } = await supabase
          .from('order_items')
          .select('*')
          .eq('shopify_line_item_id', lineItem.id)
          .eq('order_id', orderId)
          .single()

        const itemData = {
          order_id: orderId,
          shopify_line_item_id: lineItem.id,
          product_id: null, // Kein lokales Produkt für Test
          shopify_product_id: lineItem.product_id,
          shopify_variant_id: lineItem.variant_id,
          sku: lineItem.sku,
          title: lineItem.title,
          variant_title: lineItem.variant_title,
          quantity: lineItem.quantity,
          price: Math.round(parseFloat(lineItem.price) * 100),
          total_discount: Math.round(parseFloat(lineItem.total_discount) * 100),
          fulfillment_status: lineItem.fulfillment_status || 'unfulfilled',
          requires_shipping: lineItem.requires_shipping,
          taxable: lineItem.taxable,
          gift_card: lineItem.gift_card
        }

        if (existingItem) {
          await supabase
            .from('order_items')
            .update(itemData)
            .eq('id', existingItem.id)
        } else {
          await supabase
            .from('order_items')
            .insert([itemData])
        }
      } catch (itemError) {
        console.error(`❌ Fehler bei Test-Bestellposition ${lineItem.title}:`, itemError)
      }
    }

    console.log(`✅ Test-Bestellung ${testOrderData.order_number} erfolgreich verarbeitet!`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test-Bestellung ${testOrderData.order_number} erfolgreich verarbeitet`,
      order_id: orderId,
      order_number: testOrderData.order_number
    })

  } catch (error) {
    console.error('❌ Fehler im Test-Webhook:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Test fehlgeschlagen: ${error}` 
    }, { status: 500 })
  }
}

// GET endpoint to test the webhook manually
export async function GET() {
  return NextResponse.json({
    message: "Test Webhook Endpoint",
    instructions: "Send a POST request to this endpoint to test webhook functionality",
    test_url: "/api/shopify-webhook/test",
    method: "POST"
  })
} 