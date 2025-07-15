'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Product, CreateProductData, UpdateProductData } from '@/types/product'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

const productSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  sku: z.string().min(1, 'SKU ist erforderlich'),
  ean13: z.string().length(13, 'EAN13 muss genau 13 Zeichen haben').optional().or(z.literal('')),
  description: z.string().optional(),
  price: z.number().min(0, 'Preis muss positiv sein'),
  stock: z.number().min(0, 'Lagerbestand muss positiv sein'),
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  sku_level: z.enum(['grandparent', 'parent', 'child']),
  parent_id: z.string().optional().or(z.literal('')).nullable(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
}

type ParentOption = {
  id: string
  name: string
  sku: string
  sku_level: 'grandparent' | 'parent'
}

export function ProductForm({ open, onOpenChange, product, onSubmit }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([])
  const supabase = useSupabaseClient()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      ean13: product?.ean13 || '',
      description: product?.description || '',
      price: product?.price ? product.price / 100 : 0, // Convert from cents
      stock: product?.stock || 0,
      category: product?.category || '',
      sku_level: product?.sku_level || 'child',
      parent_id: product?.parent_id || '',
    },
  })

  useEffect(() => {
    async function fetchParents() {
      let filterLevels: ('grandparent' | 'parent')[] = []
      if (form.getValues('sku_level') === 'parent') {
        filterLevels = ['grandparent']
      } else if (form.getValues('sku_level') === 'child') {
        filterLevels = ['parent']
      }
      if (filterLevels.length === 0) {
        setParentOptions([])
        return
      }
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, sku_level')
        .in('sku_level', filterLevels)
      console.log('ParentOptions:', data, error)
      setParentOptions((data as ParentOption[]) || [])
    }
    fetchParents()
  }, [open, form, supabase])

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const submitData = {
        ...data,
        price: Math.round(data.price * 100), // Convert to cents
        ean13: data.ean13 || undefined,
        description: data.description || undefined,
        parent_id: data.parent_id || null,
      }

      if (product) {
        await onSubmit({ id: product.id, ...submitData } as UpdateProductData)
      } else {
        await onSubmit(submitData as CreateProductData)
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
    } finally {
      setLoading(false)
    }
  }

  const CATEGORIES = [
    'Parfume',
    'Candle',
    'Shoes',
    'T-Shirt',
    'Sweater',
    'Jogger',
    'Blazer',
    'Denim',
    'Jackets',
    'Sweatshirt & Hoodies',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Produkt bearbeiten' : 'Neues Produkt hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku_level">SKU-Level *</Label>
            <select
              id="sku_level"
              {...form.register('sku_level')}
              className="w-full border rounded px-2 py-1"
            >
              <option value="grandparent">Grandparent</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </div>

          {/* Parent-Auswahl nur für Parent und Child */}
          {form.watch('sku_level') === 'parent' && (
            <div className="space-y-2">
              <Label htmlFor="parent_id">Grandparent SKU</Label>
              <select
                id="parent_id"
                {...form.register('parent_id')}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">-- Kein Grandparent --</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} ({p.name}) [Grandparent]
                  </option>
                ))}
              </select>
            </div>
          )}
          {form.watch('sku_level') === 'child' && (
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent SKU</Label>
              <select
                id="parent_id"
                {...form.register('parent_id')}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">-- Kein Parent --</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} ({p.name}) [Parent]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Restliche Felder */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Produktname"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              {...form.register('sku')}
              placeholder="Stock Keeping Unit"
            />
            {form.formState.errors.sku && (
              <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ean13">EAN13</Label>
            <Input
              id="ean13"
              {...form.register('ean13')}
              placeholder="13-stellige EAN"
              maxLength={13}
            />
            {form.formState.errors.ean13 && (
              <p className="text-sm text-red-500">{form.formState.errors.ean13.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Produktbeschreibung"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preis (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Lagerbestand *</Label>
              <Input
                id="stock"
                type="number"
                {...form.register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie *</Label>
            <select
              id="category"
              {...form.register('category')}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">-- Kategorie wählen --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 