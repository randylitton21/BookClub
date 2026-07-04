"use client";

export default function CheckEnvPage() {
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(envVars).filter(([key, value]) => !value);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Environment Variables Check</h1>
      <p>This page shows if your Firebase environment variables are properly configured.</p>

      {missingVars.length > 0 && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: 8,
          padding: 15,
          marginBottom: 20
        }}>
          <strong>❌ MISSING ENVIRONMENT VARIABLES!</strong>
          <p style={{ marginTop: 10 }}>
            These variables are not set. This is why Firebase sync isn't working.
          </p>
          <ul style={{ marginTop: 10 }}>
            {missingVars.map(([key]) => (
              <li key={key} style={{ color: '#721c24' }}>
                <code>{key}</code>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 15, padding: 10, background: '#f1aeb5', borderRadius: 4 }}>
            <strong>Fix:</strong> Go to Vercel Dashboard → Your Project → Settings → Environment Variables
            and add the missing variables. Then redeploy.
          </div>
        </div>
      )}

      {missingVars.length === 0 && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: 8,
          padding: 15,
          marginBottom: 20
        }}>
          <strong>✅ All Environment Variables Present</strong>
          <p>If sync still doesn't work, check Firestore rules or Firebase project settings.</p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <strong>📋 Environment Variables Status:</strong>
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          padding: 15,
          marginTop: 10,
          fontSize: '14px'
        }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <code style={{ fontWeight: 'bold' }}>{key}:</code>{' '}
              {value ? (
                <span style={{ color: '#28a745' }}>
                  ✅ Set ({value.length} chars)
                </span>
              ) : (
                <span style={{ color: '#dc3545' }}>
                  ❌ Missing
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 15, background: '#e9ecef', borderRadius: 6 }}>
        <strong>🔗 Next Steps:</strong>
        <ol style={{ marginTop: 8, marginLeft: 20 }}>
          <li>If variables are missing: Add them in Vercel and redeploy</li>
          <li>If variables are present: Visit <code>/debug-sync</code> to test Firebase connection</li>
          <li>Check browser console (F12) for additional error details</li>
          <li>Test sync across multiple devices/browsers</li>
        </ol>
      </div>
    </div>
  );
}