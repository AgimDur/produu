'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductForm } from '@/components/ProductForm'
import { createProduct } from '@/app/actions/products'
import { CreateProductData, UpdateProductData } from '@/types/product'

export function AddProductButton() {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
    // Nur für neue Produkte (kein id-Feld)
    if (!('id' in data)) {
      await createProduct(data as CreateProductData)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Produkt hinzufügen
      </Button>
      <ProductForm open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </>
  )
} 