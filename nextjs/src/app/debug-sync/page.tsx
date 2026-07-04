"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { firestore, isFirebaseConfigured } from "@/lib/firebaseClient";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

export default function DebugSyncPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const runFullDiagnostic = async () => {
    setIsTesting(true);
    setLogs([]);

    try {
      // 1. Check Firebase configuration
      addLog("🔍 Starting Firebase sync diagnostic...");
      addLog(`Firebase configured: ${isFirebaseConfigured ? '✅' : '❌'}`);

      if (!isFirebaseConfigured) {
        addLog("❌ FIREBASE NOT CONFIGURED - Check environment variables!");
        addLog("Required env vars: NEXT_PUBLIC_FIREBASE_API_KEY, etc.");
        return;
      }

      // 2. Check authentication
      if (authLoading) {
        addLog("⏳ Waiting for authentication...");
        return;
      }

      if (!user) {
        addLog("❌ NOT SIGNED IN - Sign in first to test sync");
        return;
      }

      addLog(`✅ User authenticated: ${user.uid}`);
      addLog(`User email: ${user.email || 'No email'}`);

      // 3. Check Firestore connection
      if (!firestore) {
        addLog("❌ FIRESTORE NOT AVAILABLE - Firebase config issue");
        return;
      }
      addLog("✅ Firestore available");

      // 4. Test basic Firestore operations
      const testDocRef = doc(firestore, "debug", "sync_test_" + Date.now());

      try {
        // Write test
        const testData = {
          timestamp: new Date().toISOString(),
          uid: user.uid,
          testValue: "sync_test_" + Math.random()
        };

        addLog("📝 Testing Firestore write...");
        await setDoc(testDocRef, testData);
        addLog("✅ Write successful");

        // Read test
        addLog("📖 Testing Firestore read...");
        const snap = await getDoc(testDocRef);
        if (snap.exists()) {
          const data = snap.data();
          addLog(`✅ Read successful: ${data.testValue}`);
        } else {
          addLog("❌ Read failed - document not found");
        }

      } catch (firestoreError: any) {
        addLog(`❌ FIRESTORE ERROR: ${firestoreError.message}`);
        addLog(`Error code: ${firestoreError.code || 'Unknown'}`);

        if (firestoreError.code === 'permission-denied') {
          addLog("🔒 PERMISSION DENIED - Check Firestore security rules!");
          addLog("Go to Firebase Console → Firestore → Rules");
          addLog("Make sure rules allow authenticated users to read/write");
        } else if (firestoreError.code === 'unavailable') {
          addLog("🌐 FIRESTORE UNAVAILABLE - Check internet connection");
        } else if (firestoreError.code === 'not-found') {
          addLog("📁 DATABASE NOT FOUND - Create Firestore database in Firebase Console");
        }
      }

      // 5. Test CloudToolFrame-style operations
      addLog("🔄 Testing CloudToolFrame-style operations...");

      const userToolsRef = doc(firestore, "users", user.uid, "tools", "strategic_planning");

      try {
        // Test real-time listener (like CloudToolFrame uses)
        addLog("👂 Setting up real-time listener...");

        const unsubscribe = onSnapshot(
          userToolsRef,
          (snapshot) => {
            addLog("📡 Real-time listener triggered");
            if (snapshot.exists()) {
              const data = snapshot.data();
              addLog(`📄 Document exists with ${Object.keys(data || {}).length} fields`);
            } else {
              addLog("📭 Document doesn't exist yet (normal for new users)");
            }
          },
          (error) => {
            addLog(`❌ Real-time listener error: ${error.message}`);
          }
        );

        // Wait a moment for listener to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test writing tool data (like CloudToolFrame does)
        const toolData = {
          storage: {
            "prototype_strategicPlan_test123": JSON.stringify({
              businessName: "Test Company",
              testTimestamp: new Date().toISOString()
            })
          },
          updatedAt: new Date()
        };

        addLog("💾 Testing tool data write...");
        await setDoc(userToolsRef, toolData, { merge: true });
        addLog("✅ Tool data write successful");

        // Wait for real-time update
        await new Promise(resolve => setTimeout(resolve, 2000));

        unsubscribe();
        addLog("🔇 Real-time listener stopped");

      } catch (toolError: any) {
        addLog(`❌ TOOL SYNC ERROR: ${toolError.message}`);
        addLog(`Error code: ${toolError.code || 'Unknown'}`);
      }

      // 6. Summary
      addLog("🎯 DIAGNOSTIC COMPLETE");
      addLog("If you're still having sync issues:");
      addLog("1. Check Vercel environment variables are set");
      addLog("2. Check Firestore rules allow authenticated access");
      addLog("3. Verify Firebase project has Firestore enabled");
      addLog("4. Check browser console for additional errors");

    } catch (error: any) {
      addLog(`💥 UNEXPECTED ERROR: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      runFullDiagnostic();
    }
  }, [authLoading, user]);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Firebase Sync Diagnostic Tool</h1>
      <p>This tool diagnoses device-to-device sync issues step by step.</p>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={runFullDiagnostic}
          disabled={isTesting}
          style={{
            padding: '12px 24px',
            background: isTesting ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: isTesting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isTesting ? '🔍 Running Tests...' : '🚀 Run Full Diagnostic'}
        </button>
      </div>

      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: 8,
        padding: 20,
        minHeight: 300,
        fontSize: '14px',
        lineHeight: 1.5
      }}>
        <strong>📋 Diagnostic Logs:</strong>
        {logs.length === 0 ? (
          <div style={{ color: '#6c757d', fontStyle: 'italic', marginTop: 10 }}>
            Click "Run Full Diagnostic" to check Firebase sync...
          </div>
        ) : (
          <div style={{ marginTop: 10, maxHeight: '400px', overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: 4, fontFamily: 'monospace' }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, padding: 15, background: '#e9ecef', borderRadius: 6 }}>
        <strong>🔍 Quick Status:</strong>
        <div style={{ marginTop: 8 }}>
          Firebase Config: {isFirebaseConfigured ? '✅' : '❌'}<br/>
          Auth Loading: {authLoading ? '⏳' : '✅'}<br/>
          User: {user ? `✅ ${user.uid.slice(0, 8)}...` : '❌'}<br/>
          Firestore: {firestore ? '✅' : '❌'}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 15, background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 6 }}>
        <strong>⚠️ If sync still doesn't work:</strong>
        <ol style={{ marginTop: 8, marginLeft: 20 }}>
          <li>Check Vercel environment variables are set correctly</li>
          <li>Verify Firestore rules allow authenticated read/write</li>
          <li>Ensure Firebase project has Firestore database enabled</li>
          <li>Check browser console (F12) for additional error details</li>
          <li>Try signing out and back in to refresh authentication</li>
        </ol>
      </div>
    </div>
  );
}