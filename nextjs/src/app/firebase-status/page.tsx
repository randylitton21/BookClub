"use client";

import { useEffect, useState } from "react";

export default function FirebaseStatusPage() {
  const [status, setStatus] = useState<string>("Checking...");

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Check environment variables
        const envVars = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const missing = Object.entries(envVars).filter(([key, value]) => !value);
        if (missing.length > 0) {
          setStatus(`❌ MISSING ENV VARS: ${missing.map(([k]) => k).join(', ')}`);
          return;
        }

        // Try to import Firebase
        const { getApps, initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');

        // Try to initialize
        let app;
        if (getApps().length > 0) {
          app = getApps()[0];
          setStatus('✅ Firebase app already initialized');
        } else {
          app = initializeApp(envVars);
          setStatus('✅ Firebase app initialized successfully');
        }

        // Try auth
        const auth = getAuth(app);
        setStatus(prev => prev + '\n✅ Auth initialized');

        // Try firestore
        const firestore = getFirestore(app);
        setStatus(prev => prev + '\n✅ Firestore initialized');

        // Try a simple operation
        const { collection, addDoc } = await import('firebase/firestore');
        const testCollection = collection(firestore, 'status_test');
        const testDoc = await addDoc(testCollection, {
          timestamp: new Date().toISOString(),
          message: 'Firebase connectivity test'
        });

        setStatus(prev => prev + '\n✅ Firestore write successful');

        setStatus(prev => prev + '\n🎉 ALL TESTS PASSED - Firebase is working!');

      } catch (error: any) {
        console.error('Firebase test failed:', error);
        setStatus(`❌ FIREBASE ERROR: ${error.message}

Error Code: ${error.code || 'Unknown'}
Error Type: ${error.constructor.name}

Possible Causes:
• Environment variables not set in Vercel
• Firebase project misconfigured
• Network connectivity issues
• Firebase quota exceeded
• Security rules blocking access

Next Steps:
1. Check Vercel environment variables
2. Verify Firebase project settings
3. Check browser console for more details`);
      }
    };

    checkFirebase();
  }, []);

  return (
    <div style={{
      padding: 20,
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto',
      whiteSpace: 'pre-line'
    }}>
      <h1>🔥 Firebase Status Check</h1>
      <p>Testing Firebase connectivity and configuration...</p>

      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: 8,
        padding: 20,
        marginTop: 20,
        minHeight: 200,
        fontSize: '14px',
        lineHeight: 1.5
      }}>
        <strong>Status:</strong>
        <div style={{ marginTop: 10, color: status.includes('❌') ? '#dc3545' : '#28a745' }}>
          {status}
        </div>
      </div>

      <div style={{
        marginTop: 20,
        padding: 15,
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: 6
      }}>
        <strong>⚠️ If Firebase is broken:</strong>
        <ol style={{ marginTop: 8, marginLeft: 20 }}>
          <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
          <li>Add the 6 NEXT_PUBLIC_FIREBASE_* variables from your .env.local file</li>
          <li>Set "All Environments" for each variable</li>
          <li>Redeploy: Deployments tab → ⋮ → Redeploy</li>
          <li>Wait 2-3 minutes, then refresh this page</li>
        </ol>
      </div>

      <div style={{
        marginTop: 15,
        padding: 10,
        background: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: 4
      }}>
        <strong>🔍 Debug Info:</strong><br/>
        Environment: {typeof window === 'undefined' ? 'Server' : 'Client'}<br/>
        Timestamp: {new Date().toISOString()}
      </div>
    </div>
  );
}