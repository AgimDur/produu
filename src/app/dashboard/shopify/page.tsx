import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { ShopifyStoreForm } from '@/components/ShopifyStoreForm'
import { ShopifyStoreList } from '@/components/ShopifyStoreList'

export default async function ShopifyPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: stores, error } = await supabase
    .from('shopify_stores')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">Fehler beim Laden der Shopify Stores: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shopify Integration</h1>
          <p className="text-gray-600 mt-2">
            Verbinden Sie Ihre Shopify Stores und synchronisieren Sie Produkte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Neuen Store hinzufügen</h2>
          <ShopifyStoreForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Verbundene Stores</h2>
          <ShopifyStoreList stores={stores || []} />
        </div>
      </div>
    </div>
  )
} 