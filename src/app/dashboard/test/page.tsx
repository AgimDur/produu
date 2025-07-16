export default function TestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Test Page</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">✅ Diese Seite lädt erfolgreich!</p>
        <p className="text-green-600 text-sm mt-2">
          Wenn Sie diese Seite sehen können, funktioniert das grundlegende Routing und Rendering.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-blue-800 font-semibold mb-2">Umgebungsvariablen Status:</h2>
        <ul className="text-blue-600 text-sm space-y-1">
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Gesetzt' : '❌ Nicht gesetzt'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Gesetzt' : '❌ Nicht gesetzt'}</li>
          <li>NODE_ENV: {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </div>
  )
} 