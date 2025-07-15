import Shopify from 'shopify-api-node'
import { ShopifyStore, ShopifyProductData, SyncResult } from '@/types/shopify'
import { ShopifyOrder, ShopifyOrderItem } from '@/types/order'
import { Product } from '@/types/product'

export class ShopifyClient {
  private shopify: Shopify

  constructor(store: ShopifyStore) {
    this.shopify = new Shopify({
      shopName: store.shopify_domain,
      accessToken: store.access_token,
      apiVersion: '2024-01' // Use latest stable version
    })
  }

  // Test connection to Shopify store
  async testConnection(): Promise<boolean> {
    try {
      await this.shopify.shop.get()
      return true
    } catch (error) {
      console.error('Shopify connection test failed:', error)
      return false
    }
  }

  // Get store information
  async getShopInfo() {
    try {
      return await this.shopify.shop.get()
    } catch (error) {
      console.error('Failed to get shop info:', error)
      throw error
    }
  }

  // Get all products from Shopify
  async getProducts(limit = 250): Promise<ShopifyProductData[]> {
    try {
      const products = await this.shopify.product.list({ limit })
      return products as unknown as ShopifyProductData[]
    } catch (error) {
      console.error('Failed to fetch Shopify products:', error)
      throw error
    }
  }

  // Get all orders from Shopify
  async getOrders(limit = 250, status = 'any'): Promise<ShopifyOrder[]> {
    try {
      const orders = await this.shopify.order.list({ limit, status })
      return orders as unknown as ShopifyOrder[]
    } catch (error) {
      console.error('Failed to fetch Shopify orders:', error)
      throw error
    }
  }

  // Get a single order by ID
  async getOrder(orderId: number): Promise<ShopifyOrder> {
    try {
      const order = await this.shopify.order.get(orderId)
      return order as unknown as ShopifyOrder
    } catch (error) {
      console.error('Failed to fetch Shopify order:', error)
      throw error
    }
  }

  // Create a product in Shopify
  async createProduct(product: Product): Promise<ShopifyProductData> {
    try {
      const shopifyProduct = {
        title: product.name,
        body_html: product.description || '',
        vendor: 'Default Vendor',
        product_type: product.category,
        status: 'active',
        variants: [
          {
            price: (product.price / 100).toString(), // Convert from cents
            sku: product.sku,
            inventory_quantity: product.stock,
            inventory_management: 'shopify',
            barcode: product.ean13 || undefined
          }
        ]
      }

      const createdProduct = await this.shopify.product.create(shopifyProduct)
      return createdProduct as unknown as ShopifyProductData
    } catch (error) {
      console.error('Failed to create Shopify product:', error)
      throw error
    }
  }

  // Update a product in Shopify
  async updateProduct(shopifyProductId: number, product: Product): Promise<ShopifyProductData> {
    try {
      const updateData = {
        title: product.name,
        body_html: product.description || '',
        vendor: 'Default Vendor',
        product_type: product.category,
        variants: [
          {
            price: (product.price / 100).toString(),
            sku: product.sku,
            inventory_quantity: product.stock,
            inventory_management: 'shopify',
            barcode: product.ean13 || undefined
          }
        ]
      }

      const updatedProduct = await this.shopify.product.update(shopifyProductId, updateData)
      return updatedProduct as unknown as ShopifyProductData
    } catch (error) {
      console.error('Failed to update Shopify product:', error)
      throw error
    }
  }

  // Delete a product from Shopify
  async deleteProduct(shopifyProductId: number): Promise<void> {
    try {
      await this.shopify.product.delete(shopifyProductId)
    } catch (error) {
      console.error('Failed to delete Shopify product:', error)
      throw error
    }
  }

  // Update inventory for a product variant
  async updateInventory(inventoryItemId: number, quantity: number): Promise<void> {
    try {
      await this.shopify.inventoryLevel.set({
        inventory_item_id: inventoryItemId,
        location_id: await this.getMainLocationId(),
        available: quantity
      })
    } catch (error) {
      console.error('Failed to update inventory:', error)
      throw error
    }
  }

  // Get the main location ID (usually the first location)
  private async getMainLocationId(): Promise<number> {
    try {
      const locations = await this.shopify.location.list()
      return locations[0]?.id || 1 // Default to 1 if no locations found
    } catch (error) {
      console.error('Failed to get location ID:', error)
      return 1 // Fallback
    }
  }

  // Sync local products to Shopify
  async syncProductsToShopify(localProducts: Product[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      message: 'Sync completed successfully',
      synced_products: 0,
      errors: []
    }

    for (const product of localProducts) {
      try {
        // Check if product already exists in Shopify
        const existingProducts = await this.shopify.product.list({ 
          limit: 1, 
          sku: product.sku 
        })

        if (existingProducts.length > 0) {
          // Update existing product
          await this.updateProduct(existingProducts[0].id, product)
        } else {
          // Create new product
          await this.createProduct(product)
        }

        result.synced_products!++
      } catch (error) {
        const errorMessage = `Failed to sync product ${product.sku}: ${error}`
        result.errors!.push(errorMessage)
        console.error(errorMessage)
      }
    }

    if (result.errors!.length > 0) {
      result.success = false
      result.message = `Sync completed with ${result.errors!.length} errors`
    }

    return result
  }

  // Get inventory levels for all products
  async getInventoryLevels(): Promise<unknown[]> {
    try {
      const inventoryLevels = await this.shopify.inventoryLevel.list({})
      return inventoryLevels
    } catch (error) {
      console.error('Failed to fetch inventory levels:', error)
      throw error
    }
  }
} 