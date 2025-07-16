import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExportButtons } from '@/components/ExportButtons'
import { getOrders } from '@/lib/kv'
import { Order } from '@/types/order'

export default async function OrdersPage() {
  try {
    const orders = await getOrders() as Order[]

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

    // Calculate stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
    const pendingOrders = orders.filter(order => order.financial_status === 'pending').length

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bestellungen</h1>
          <ExportButtons type="orders" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Bestellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Umsatz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalRevenue / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehende Bestellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
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
                <TableHead>Status</TableHead>
                <TableHead>Zahlungsstatus</TableHead>
                <TableHead>Gesamt</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Keine Bestellungen gefunden
                  </TableCell>
                </TableRow>
              )}
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.customer_first_name} {order.customer_last_name}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.fulfillment_status)}>
                      {order.fulfillment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFinancialStatusColor(order.financial_status)}>
                      {order.financial_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(order.total_price / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Orders page error:', error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bestellungen</h1>
          <ExportButtons type="orders" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Ein Fehler ist beim Laden der Bestellungen aufgetreten</p>
          <p className="text-red-600 text-sm mt-2">
            Bitte versuchen Sie es erneut.
          </p>
        </div>
      </div>
    )
  }
} 