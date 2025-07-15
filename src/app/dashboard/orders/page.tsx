import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExportButtons } from '@/components/ExportButtons'
import { getOrderStats } from '@/app/actions/orders'
import { Order } from '@/types/order'

export default async function OrdersPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">Fehler beim Laden der Bestellungen: {error.message}</div>
  }

  const stats = await getOrderStats()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800'
      case 'unfulfilled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFinancialStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bestellungen</h1>
        <ExportButtons type="orders" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Bestellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_orders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Umsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.total_revenue / 100).toLocaleString('de-DE', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_orders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versendet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fulfilled_orders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bestellnummer</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Gesamtpreis</TableHead>
              <TableHead>Zahlungsstatus</TableHead>
              <TableHead>Versandstatus</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Keine Bestellungen gefunden
                </TableCell>
              </TableRow>
            ) : (
              orders?.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.customer_first_name} {order.customer_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    {(order.total_price / 100).toLocaleString('de-DE', { 
                      style: 'currency', 
                      currency: order.currency || 'EUR' 
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getFinancialStatusColor(order.financial_status)}>
                      {order.financial_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.fulfillment_status)}>
                      {order.fulfillment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.tags && (
                      <div className="flex flex-wrap gap-1">
                        {order.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 