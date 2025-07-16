'use server'

import * as XLSX from 'exceljs'
import Papa from 'papaparse'
import { getProducts, getOrders } from '@/lib/kv'

// Export products as CSV
export async function exportProductsAsCSV(): Promise<string> {
  try {
    const products = await getProducts() as any[]

    const csvData = products?.map((product: any) => ({
      Name: product.name,
      SKU: product.sku,
      'SKU-Level': product.sku_level,
      Kategorie: product.category,
      Preis: (product.price / 100).toFixed(2),
      Lagerbestand: product.stock,
      EAN13: product.ean13 || '',
      Beschreibung: product.description || '',
      'Parent ID': product.parent_id || '',
      'Erstellt am': new Date(product.created_at).toLocaleDateString('de-DE'),
      'Aktualisiert am': new Date(product.updated_at).toLocaleDateString('de-DE')
    })) || []

    return Papa.unparse(csvData)
  } catch (error) {
    console.error('Error exporting products as CSV:', error)
    throw new Error('Fehler beim Exportieren der Produkte')
  }
}

// Export products as Excel
export async function exportProductsAsExcel(): Promise<Buffer | ArrayBuffer> {
  try {
    const products = await getProducts() as any[]

    const workbook = new XLSX.Workbook()
    const worksheet = workbook.addWorksheet('Produkte')

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'SKU-Level', key: 'sku_level', width: 12 },
      { header: 'Kategorie', key: 'category', width: 15 },
      { header: 'Preis (€)', key: 'price', width: 12 },
      { header: 'Lagerbestand', key: 'stock', width: 12 },
      { header: 'EAN13', key: 'ean13', width: 15 },
      { header: 'Beschreibung', key: 'description', width: 30 },
      { header: 'Parent ID', key: 'parent_id', width: 15 },
      { header: 'Erstellt am', key: 'created_at', width: 15 },
      { header: 'Aktualisiert am', key: 'updated_at', width: 15 }
    ]

    // Add data
    products?.forEach((product: any) => {
      worksheet.addRow({
        name: product.name,
        sku: product.sku,
        sku_level: product.sku_level,
        category: product.category,
        price: (product.price / 100).toFixed(2),
        stock: product.stock,
        ean13: product.ean13 || '',
        description: product.description || '',
        parent_id: product.parent_id || '',
        created_at: new Date(product.created_at).toLocaleDateString('de-DE'),
        updated_at: new Date(product.updated_at).toLocaleDateString('de-DE')
      })
    })

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    return await workbook.xlsx.writeBuffer()
  } catch (error) {
    console.error('Error exporting products as Excel:', error)
    throw new Error('Fehler beim Exportieren der Produkte')
  }
}

// Export orders as CSV
export async function exportOrdersAsCSV(): Promise<string> {
  try {
    const orders = await getOrders() as any[]

    const csvData = orders?.map((order: any) => ({
      'Bestellnummer': order.order_number,
      'Kunde': `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
      'Email': order.customer_email,
      'Status': order.fulfillment_status,
      'Zahlungsstatus': order.financial_status,
      'Gesamtpreis': (order.total_price / 100).toFixed(2),
      'Währung': order.currency,
      'Tags': order.tags || '',
      'Notiz': order.note || '',
      'Erstellt am': new Date(order.created_at).toLocaleDateString('de-DE')
    })) || []

    return Papa.unparse(csvData)
  } catch (error) {
    console.error('Error exporting orders as CSV:', error)
    throw new Error('Fehler beim Exportieren der Bestellungen')
  }
}

// Export orders as Excel
export async function exportOrdersAsExcel(): Promise<Buffer | ArrayBuffer> {
  try {
    const orders = await getOrders() as any[]

    const workbook = new XLSX.Workbook()
    const worksheet = workbook.addWorksheet('Bestellungen')

    // Add headers
    worksheet.columns = [
      { header: 'Bestellnummer', key: 'order_number', width: 15 },
      { header: 'Kunde', key: 'customer', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Zahlungsstatus', key: 'financial_status', width: 15 },
      { header: 'Gesamtpreis (€)', key: 'total_price', width: 15 },
      { header: 'Währung', key: 'currency', width: 10 },
      { header: 'Tags', key: 'tags', width: 20 },
      { header: 'Notiz', key: 'note', width: 30 },
      { header: 'Erstellt am', key: 'created_at', width: 15 }
    ]

    // Add data
    orders?.forEach((order: any) => {
      worksheet.addRow({
        order_number: order.order_number,
        customer: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
        email: order.customer_email,
        status: order.fulfillment_status,
        financial_status: order.financial_status,
        total_price: (order.total_price / 100).toFixed(2),
        currency: order.currency,
        tags: order.tags || '',
        note: order.note || '',
        created_at: new Date(order.created_at).toLocaleDateString('de-DE')
      })
    })

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    return await workbook.xlsx.writeBuffer()
  } catch (error) {
    console.error('Error exporting orders as Excel:', error)
    throw new Error('Fehler beim Exportieren der Bestellungen')
  }
} 