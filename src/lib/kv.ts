import { kv } from '@vercel/kv'

export { kv }

// Helper functions for common operations
export async function getProducts() {
  try {
    const products = await kv.get('products')
    return products || []
  } catch (error) {
    console.error('Error getting products:', error)
    return []
  }
}

export async function saveProducts(products: any[]) {
  try {
    await kv.set('products', products)
    return true
  } catch (error) {
    console.error('Error saving products:', error)
    return false
  }
}

export async function getOrders() {
  try {
    const orders = await kv.get('orders')
    return orders || []
  } catch (error) {
    console.error('Error getting orders:', error)
    return []
  }
}

export async function saveOrders(orders: any[]) {
  try {
    await kv.set('orders', orders)
    return true
  } catch (error) {
    console.error('Error saving orders:', error)
    return false
  }
}

export async function getShopifyStores() {
  try {
    const stores = await kv.get('shopify_stores')
    return stores || []
  } catch (error) {
    console.error('Error getting Shopify stores:', error)
    return []
  }
}

export async function saveShopifyStores(stores: any[]) {
  try {
    await kv.set('shopify_stores', stores)
    return true
  } catch (error) {
    console.error('Error saving Shopify stores:', error)
    return false
  }
} 