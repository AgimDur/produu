'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { LogOut, Package } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Produkt-Management</h1>
            </div>
            
            <nav className="space-y-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                  Produkte
                </div>
              </div>
            </nav>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 