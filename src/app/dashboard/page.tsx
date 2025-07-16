import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddProductButton } from '@/components/AddProductButton'
import { ExportButtons } from '@/components/ExportButtons'
import { Product } from '@/types/product'
import React from 'react'
import { getProducts } from '@/lib/kv'

export default async function DashboardPage() {
  try {
    const products = await getProducts() as Product[]

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
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Keine Produkte gefunden
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{(product.price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                  <TableCell>{product.sku_level}</TableCell>
                  <TableCell>{product.parent_id || '-'}</TableCell>
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