'use server'

import { revalidatePath } from 'next/cache'
import { CreateProductData, UpdateProductData, Product } from '@/types/product'
import { getProducts, saveProducts } from '@/lib/kv'

export async function getProductsAction(): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products as Product[]
  } catch (error) {
    console.error('Error getting products:', error)
    throw new Error('Fehler beim Laden der Produkte')
  }
}

export async function createProduct(productData: CreateProductData): Promise<Product> {
  try {
    const products = await getProducts() as Product[]
    
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    products.push(newProduct)
    await saveProducts(products)
    
    revalidatePath('/dashboard')
    return newProduct
  } catch (error) {
    console.error('Error creating product:', error)
    throw new Error('Fehler beim Erstellen des Produkts')
  }
}

export async function updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
  try {
    const products = await getProducts() as Product[]
    const productIndex = products.findIndex(p => p.id === id)
    
    if (productIndex === -1) {
      throw new Error('Produkt nicht gefunden')
    }
    
    products[productIndex] = {
      ...products[productIndex],
      ...productData,
      updated_at: new Date().toISOString(),
    }
    
    await saveProducts(products)
    
    revalidatePath('/dashboard')
    return products[productIndex]
  } catch (error) {
    console.error('Error updating product:', error)
    throw new Error('Fehler beim Aktualisieren des Produkts')
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const products = await getProducts() as Product[]
    const filteredProducts = products.filter(p => p.id !== id)
    
    await saveProducts(filteredProducts)
    
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error deleting product:', error)
    throw new Error('Fehler beim Löschen des Produkts')
  }
} 