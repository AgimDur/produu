import Shopify from 'shopify-api-node'
import { ShopifyStore } from '@/types/shopify'

export class ShopifyClient {
  private client: Shopify

  constructor(store: ShopifyStore) {
    this.client = new Shopify({
      shopName: store.shopify_domain,
      accessToken: store.access_token,
      apiVersion: '2024-01'
    })
  }

  // Test connection to Shopify
  async testConnection(): Promise<boolean> {
    try {
      await this.client.shop.get()
      return true
    } catch (error) {
      console.error('Shopify connection test failed:', error)
      return false
    }
  }

  // Get all products from Shopify
  async getProducts(): Promise<any[]> {
    try {
      const products = await this.client.product.list({ limit: 250 })
      return products
    } catch (error) {
      console.error('Error getting Shopify products:', error)
      throw error
    }
  }

  // Get all orders from Shopify
  async getOrders(limit: number = 50, status: string = 'any'): Promise<any[]> {
    try {
      const orders = await this.client.order.list({ 
        limit, 
        status,
        fields: 'id,order_number,email,customer,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,tags,note,processed_at,cancelled_at,shipping_address,billing_address'
      })
      return orders
    } catch (error) {
      console.error('Error getting Shopify orders:', error)
      throw error
    }
  }

  // Sync products to Shopify
  async syncProductsToShopify(products: any[]): Promise<any> {
    try {
      let syncedCount = 0
      const errors: string[] = []

      for (const product of products) {
        try {
          // Check if product exists in Shopify
          const existingProducts = await this.client.product.list({
            title: product.name,
            limit: 1
          })

          if (existingProducts.length > 0) {
            // Update existing product
            await this.client.product.update(existingProducts[0].id, {
              title: product.name,
              body_html: product.description || '',
              vendor: product.category,
              product_type: product.sku_level,
              tags: product.sku,
              variants: [{
                price: (product.price / 100).toString(),
                inventory_quantity: product.stock,
                sku: product.sku
              }]
            })
          } else {
            // Create new product
            await this.client.product.create({
              title: product.name,
              body_html: product.description || '',
              vendor: product.category,
              product_type: product.sku_level,
              tags: product.sku,
              variants: [{
                price: (product.price / 100).toString(),
                inventory_quantity: product.stock,
                sku: product.sku
              }]
            })
          }
          syncedCount++
        } catch (error) {
          errors.push(`Product ${product.name}: ${error}`)
        }
      }

      return {
        success: errors.length === 0,
        message: `Synced ${syncedCount} products to Shopify`,
        synced_products: syncedCount,
        errors
      }
    } catch (error) {
      console.error('Error syncing products to Shopify:', error)
      throw error
    }
  }
} 