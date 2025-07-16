export interface ShopifyStore {
  id: string
  created_at: string
  store_name: string
  shopify_domain: string
  access_token: string
  api_key: string
  api_secret: string
  webhook_secret?: string
  is_active: boolean
  sync_status: 'idle' | 'syncing' | 'success' | 'error'
  last_sync_at?: string
}

export interface ShopifyProduct {
  id: string
  created_at: string
  local_product_id: string
  shopify_product_id: number
  shopify_variant_id?: number
  shopify_store_id: string
  last_synced_at?: string
  sync_status: 'pending' | 'syncing' | 'synced' | 'error'
}

export interface CreateShopifyStoreData {
  store_name: string
  shopify_domain: string
  access_token: string
  api_key: string
  api_secret: string
  webhook_secret?: string
}

export interface UpdateShopifyStoreData extends Partial<CreateShopifyStoreData> {
  id: string
}

export interface ShopifyProductData {
  id: number
  title: string
  body_html?: string
  vendor?: string
  product_type?: string
  created_at: string
  updated_at: string
  published_at?: string
  template_suffix?: string
  status?: string
  published_scope?: string
  tags?: string
  admin_graphql_api_id?: string
  variants: ShopifyVariant[]
  options?: ShopifyOption[]
  images?: ShopifyImage[]
  image?: ShopifyImage
}

export interface ShopifyVariant {
  id: number
  product_id: number
  title: string
  price: string
  sku: string
  position: number
  inventory_policy?: string
  compare_at_price?: string
  fulfillment_service?: string
  inventory_management?: string
  option1?: string
  option2?: string
  option3?: string
  created_at: string
  updated_at: string
  taxable: boolean
  barcode?: string
  grams?: number
  image_id?: number
  weight?: number
  weight_unit?: string
  inventory_item_id: number
  inventory_quantity: number
  old_inventory_quantity: number
  requires_shipping: boolean
  admin_graphql_api_id?: string
}

export interface ShopifyOption {
  id: number
  product_id: number
  name: string
  position: number
  values: string[]
}

export interface ShopifyImage {
  id: number
  product_id: number
  position: number
  created_at: string
  updated_at: string
  alt?: string
  width: number
  height: number
  src: string
  variant_ids: number[]
  admin_graphql_api_id?: string
}

export interface SyncResult {
  success: boolean
  message: string
  synced_products?: number
  synced_orders?: number
  errors?: string[]
} 