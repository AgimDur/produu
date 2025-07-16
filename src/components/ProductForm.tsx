'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createProduct, updateProduct } from '@/app/actions/products'
import { Product } from '@/types/product'

interface ProductFormProps {
  product?: Product
  trigger?: React.ReactNode
}

export function ProductForm({ product, trigger }: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      ean13: product?.ean13 || '',
      description: product?.description || '',
      price: product ? (product.price / 100).toString() : '',
      stock: product?.stock.toString() || '',
      category: product?.category || '',
      parent_id: product?.parent_id || '',
      sku_level: product?.sku_level || 'child'
    }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      const productData = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        stock: parseInt(data.stock),
        parent_id: data.parent_id || null
      }

      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await createProduct(productData)
      }

      setOpen(false)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Produkt hinzufügen</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Produkt bearbeiten' : 'Neues Produkt'}</DialogTitle>
          <DialogDescription>
            {product ? 'Bearbeiten Sie die Produktdetails.' : 'Fügen Sie ein neues Produkt hinzu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...form.register('sku', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preis (€)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                {...form.register('price', { required: true, min: 0 })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Lagerbestand</Label>
              <Input 
                id="stock" 
                type="number" 
                {...form.register('stock', { required: true, min: 0 })} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Input id="category" {...form.register('category', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku_level">SKU-Level</Label>
            <select 
              id="sku_level" 
              {...form.register('sku_level')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="grandparent">Grandparent</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ean13">EAN13 (optional)</Label>
            <Input id="ean13" {...form.register('ean13')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea id="description" {...form.register('description')} />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Speichern...' : (product ? 'Aktualisieren' : 'Erstellen')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 