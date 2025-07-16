import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddProductButton } from '@/components/AddProductButton'
import { ExportButtons } from '@/components/ExportButtons'
import { Product } from '@/types/product'
import React from 'react'

export default async function DashboardPage() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Produkte</h1>
            <div className="flex gap-2">
              <ExportButtons type="products" />
              <AddProductButton />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Fehler beim Laden der Produkte: {error.message}</p>
            <p className="text-red-600 text-sm mt-2">
              Bitte überprüfen Sie die Datenbankverbindung und versuchen Sie es erneut.
            </p>
          </div>
        </div>
      )
    }

    // Gruppiere Produkte
    const grandparents = products?.filter((p: Product) => p.sku_level === 'grandparent') || []
    const parents = products?.filter((p: Product) => p.sku_level === 'parent') || []
    const children = products?.filter((p: Product) => p.sku_level === 'child') || []

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Produkte</h1>
          <div className="flex gap-2">
            <ExportButtons type="products" />
            <AddProductButton />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Lagerbestand</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>SKU-Level</TableHead>
                <TableHead>Parent SKU</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grandparents.length === 0 && parents.length === 0 && children.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Keine Produkte gefunden
                  </TableCell>
                </TableRow>
              )}
              {grandparents.map((grandparent) => (
                <React.Fragment key={grandparent.id}>
                  <TableRow key={grandparent.id} className="bg-gray-100">
                    <TableCell className="font-bold">{grandparent.name}</TableCell>
                    <TableCell>{grandparent.category}</TableCell>
                    <TableCell>{grandparent.stock}</TableCell>
                    <TableCell>{(grandparent.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                    <TableCell>{grandparent.sku_level}</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  {parents.filter((p) => p.parent_id === grandparent.id).map((parent) => (
                    <React.Fragment key={parent.id}>
                      <TableRow key={parent.id} className="bg-gray-50">
                        <TableCell className="pl-8">{parent.name}</TableCell>
                        <TableCell>{parent.category}</TableCell>
                        <TableCell>{parent.stock}</TableCell>
                        <TableCell>{(parent.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                        <TableCell>{parent.sku_level}</TableCell>
                        <TableCell>
                          {grandparent.sku}
                        </TableCell>
                      </TableRow>
                      {children.filter((c) => c.parent_id === parent.id).map((child) => (
                        <TableRow key={child.id}>
                          <TableCell className="pl-16">{child.name}</TableCell>
                          <TableCell>{child.category}</TableCell>
                          <TableCell>{child.stock}</TableCell>
                          <TableCell>{(child.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                          <TableCell>{child.sku_level}</TableCell>
                          <TableCell>
                            {parent.sku}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              {/* Eltern ohne Grandparent */}
              {parents.filter((p) => !p.parent_id).map((parent) => (
                <TableRow key={parent.id} className="bg-gray-50">
                  <TableCell className="pl-8">{parent.name}</TableCell>
                  <TableCell>{parent.category}</TableCell>
                  <TableCell>{parent.stock}</TableCell>
                  <TableCell>{(parent.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                  <TableCell>{parent.sku_level}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
              {/* Kinder ohne Parent */}
              {children.filter((c) => !c.parent_id).map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="pl-16">{child.name}</TableCell>
                  <TableCell>{child.category}</TableCell>
                  <TableCell>{child.stock}</TableCell>
                  <TableCell>{(child.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                  <TableCell>{child.sku_level}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Produkte</h1>
          <div className="flex gap-2">
            <ExportButtons type="products" />
            <AddProductButton />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Ein unerwarteter Fehler ist aufgetreten</p>
          <p className="text-red-600 text-sm mt-2">
            Bitte überprüfen Sie die Konfiguration und versuchen Sie es erneut.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-red-500 mt-2 bg-red-100 p-2 rounded">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          )}
        </div>
      </div>
    )
  }
} 