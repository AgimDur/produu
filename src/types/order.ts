export interface Order {
  id: string
  created_at: string
  shopify_order_id: number
  shopify_store_id: string
  order_number: string
  customer_email?: string
  customer_first_name?: string
  customer_last_name?: string
  total_price: number
  subtotal_price: number
  total_tax: number
  currency: string
  financial_status: string
  fulfillment_status: string
  order_status: string
  shipping_address?: unknown
  billing_address?: unknown
  tags?: string
  note?: string
  processed_at?: string
  cancelled_at?: string
  cancelled_reason?: string
  last_synced_at?: string
  sync_status: 'synced' | 'pending' | 'error'
}

export interface OrderItem {
  id: string
  created_at: string
  order_id: string
  shopify_line_item_id: number
  product_id?: string
  shopify_product_id?: number
  shopify_variant_id?: number
  sku?: string
  title: string
  variant_title?: string
  quantity: number
  price: number
  total_discount: number
  fulfillment_status: string
  requires_shipping: boolean
  taxable: boolean
  gift_card: boolean
}

export interface ShopifyOrder {
  id: number
  email?: string
  closed_at?: string
  created_at: string
  updated_at: string
  number: number
  note?: string
  token: string
  gateway?: string
  test: boolean
  total_price: string
  subtotal_price: string
  total_weight: number
  total_tax: string
  taxes_included: boolean
  currency: string
  financial_status: string
  confirmed: boolean
  total_discounts: string
  name: string
  processed_at?: string
  cancelled_at?: string
  cancel_reason?: string
  total_price_usd: string
  user_id?: number
  location_id?: number
  source_identifier?: string
  source_url?: string
  device_id?: number
  phone?: string
  customer_locale?: string
  app_id?: number
  browser_ip?: string
  landing_site?: string
  landing_site_ref?: string
  referring_site?: string
  order_number: string
  shipping_lines: unknown[]
  billing_address?: unknown
  shipping_address?: unknown
  fulfillments: unknown[]
  client_details?: unknown
  line_items: ShopifyOrderItem[]
  payment_details?: unknown
  refunds: unknown[]
  customer?: unknown
  tags: string
  note_attributes: unknown[]
  properties: unknown[]
  total_line_items_price: string
  total_outstanding: string
  total_tip_received: string
  original_total_duties_set: string
  current_total_duties_set: string
  admin_graphql_api_id: string
  discount_codes: unknown[]
  discount_applications: unknown[]
  presentment_currency?: string
}

export interface ShopifyOrderItem {
  id: number
  variant_id: number
  title: string
  quantity: number
  sku: string
  variant_title?: string
  vendor?: string
  fulfillment_service: string
  product_id: number
  requires_shipping: boolean
  taxable: boolean
  gift_card: boolean
  name: string
  variant_inventory_management: string
  properties: unknown[]
  product_exists: boolean
  fulfillable_quantity: number
  grams: number
  price: string
  total_discount: string
  fulfillment_status?: string
  price_set: unknown
  total_discount_set: unknown
  discount_allocations: unknown[]
  duties: unknown[]
  admin_graphql_api_id: string
  tax_lines: unknown[]
}

export interface SyncResult {
  success: boolean
  message: string
  synced_orders?: number
  synced_products?: number
  errors?: string[]
} 