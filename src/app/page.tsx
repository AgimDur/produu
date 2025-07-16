'use client'

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produkt-Management</h1>
          <p className="text-gray-600 mt-2">
            Melden Sie sich an, um Ihre Produkte zu verwalten
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              card: 'shadow-lg',
            }
          }}
        />
      </div>
    </div>
  )
}
