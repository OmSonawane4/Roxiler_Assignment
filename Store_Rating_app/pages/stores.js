import { useEffect } from 'react'
import Link from 'next/link'

export default function StoresRedirect() {
  useEffect(() => {
    const url = 'http://localhost:3001/stores'
    // Redirect to the Vite Store Directory if running
    window.location.href = url
  }, [])

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Opening Store Directory…</h1>
        <p>If you are not redirected automatically, click the button below.</p>
        <Link href="http://localhost:3001/stores" legacyBehavior>
          <a style={{
            display: 'inline-block',
            padding: '10px 16px',
            borderRadius: 10,
            background: '#7b1fa2',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700
          }}>Open Stores</a>
        </Link>
        <p style={{ marginTop: 12, color: '#64748b' }}>
          Make sure the Vite app is running (frontend): <code>npm run dev</code>
        </p>
      </div>
    </main>
  )
}
