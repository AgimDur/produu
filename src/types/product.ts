export interface Product {
  id: string
  created_at: string
  updated_at: string
  name: string
  sku: string
  ean13?: string
  description?: string
  price: number
  stock: number
  category: string
  parent_id?: string | null
  sku_level: 'grandparent' | 'parent' | 'child'
}

export interface CreateProductData {
  name: string
  sku: string
  ean13?: string
  description?: string
  price: number
  stock: number
  category: string
  parent_id?: string | null
  sku_level: 'grandparent' | 'parent' | 'child'
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
} 