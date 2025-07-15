'use client'

import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { exportProductsAsCSV, exportProductsAsExcel, exportOrdersAsCSV, exportOrdersAsExcel } from '@/app/actions/export'

interface ExportButtonsProps {
  type: 'products' | 'orders'
}

export function ExportButtons({ type }: ExportButtonsProps) {
  const handleCSVExport = async () => {
    try {
      const csvData = type === 'products' 
        ? await exportProductsAsCSV() 
        : await exportOrdersAsCSV()
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${type === 'products' ? 'produkte' : 'bestellungen'}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Fehler beim CSV-Export:', error)
      alert('Fehler beim Export der Daten')
    }
  }

  const handleExcelExport = async () => {
    try {
      const excelData = type === 'products' 
        ? await exportProductsAsExcel() 
        : await exportOrdersAsExcel()
      
      const blob = new Blob([excelData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${type === 'products' ? 'produkte' : 'bestellungen'}_${new Date().toISOString().split('T')[0]}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Fehler beim Excel-Export:', error)
      alert('Fehler beim Export der Daten')
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleCSVExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        CSV Export
      </Button>
      <Button
        onClick={handleExcelExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel Export
      </Button>
    </div>
  )
} 