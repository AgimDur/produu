'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { CreateProductData, UpdateProductData } from '@/types/product'

export async function getProducts() {
  const supabase = createServerComponentClient({ cookies })
  const session = await supabase.auth.getSession();
  console.log('Server-Session:', session);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Fehler beim Laden der Produkte: ${error.message}`)
  }

  return data
}

export async function createProduct(productData: CreateProductData) {
  const supabase = createServerComponentClient({ cookies })
  const { error } = await supabase
    .from('products')
    .insert([productData])

  if (error) {
    throw new Error(`Fehler beim Erstellen des Produkts: ${error.message}`)
  }

  revalidatePath('/dashboard')
}

export async function updateProduct(productData: UpdateProductData) {
  const supabase = createServerComponentClient({ cookies })
  const { id, ...updateData } = productData
  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)

  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Produkts: ${error.message}`)
  }

  revalidatePath('/dashboard')
}

export async function deleteProduct(id: string) {
  const supabase = createServerComponentClient({ cookies })
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Fehler beim Löschen des Produkts: ${error.message}`)
  }

  revalidatePath('/dashboard')
} 