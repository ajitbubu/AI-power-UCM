export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        UCM AI - Universal Consent Manager
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        A privacy-first consent management platform with AI-powered cookie classification
      </p>
      
      <div style={{ 
        backgroundColor: '#f0f7ff', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #0066cc'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0066cc' }}>
          🚀 Quick Links
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '0.75rem' }}>
            <a href="/product" style={{ 
              color: '#0066cc', 
              textDecoration: 'none', 
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              🛍️ Product Page (with Cookie Banner)
            </a>
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <a href="/test-gpc" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '1.1rem' }}>
              🛡️ GPC Detection Test Page
            </a>
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <a href="/admin/audit" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '1.1rem' }}>
              📊 Admin Audit Dashboard
            </a>
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <a href="http://localhost:8000/docs" target="_blank" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '1.1rem' }}>
              📚 API Documentation
            </a>
          </li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#333' }}>Features</h2>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>✅ Multi-framework support (TCFv2.2, GPPv2, Google Consent Mode)</li>
          <li>✅ GPC (Global Privacy Control) detection</li>
          <li>✅ Geo-based configuration (EU/US)</li>
          <li>✅ Cookie banner with customizable preferences</li>
          <li>✅ Admin dashboard for audit logs</li>
          <li>✅ AI-powered cookie classification</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
          <strong>Backend API:</strong> http://localhost:8000
        </p>
      </div>
    </main>
  )
}
