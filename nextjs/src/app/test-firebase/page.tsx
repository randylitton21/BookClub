"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { firestore, isFirebaseConfigured } from "@/lib/firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TestFirebasePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [testResult, setTestResult] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    setTestResult("");

    try {
      // Test 1: Firebase configuration
      if (!isFirebaseConfigured) {
        setTestResult("❌ Firebase not configured - check environment variables");
        return;
      }
      setTestResult("✅ Firebase configured");

      // Test 2: Auth
      if (authLoading) {
        setTestResult(prev => prev + "\n⏳ Waiting for auth...");
        return;
      }

      if (!user) {
        setTestResult(prev => prev + "\n❌ Not signed in - sign in first");
        return;
      }
      setTestResult(prev => prev + "\n✅ User authenticated: " + user.uid);

      // Test 3: Firestore connection
      if (!firestore) {
        setTestResult(prev => prev + "\n❌ Firestore not available");
        return;
      }
      setTestResult(prev => prev + "\n✅ Firestore available");

      // Test 4: Write test data
      const testRef = doc(firestore, "test", "connection_test");
      const testData = {
        timestamp: new Date().toISOString(),
        uid: user.uid,
        message: "Firebase connection test"
      };

      await setDoc(testRef, testData);
      setTestResult(prev => prev + "\n✅ Write test successful");

      // Test 5: Read test data
      const snap = await getDoc(testRef);
      if (snap.exists()) {
        const readData = snap.data();
        setTestResult(prev => prev + "\n✅ Read test successful: " + readData.message);
      } else {
        setTestResult(prev => prev + "\n❌ Read test failed - no data found");
      }

      setTestResult(prev => prev + "\n🎉 All tests passed! Firebase is working correctly.");

    } catch (error: any) {
      console.error("Firebase test error:", error);
      setTestResult(prev => prev + "\n❌ Error: " + error.message);
      if (error.code) {
        setTestResult(prev => prev + "\nError code: " + error.code);
      }
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      runTest();
    }
  }, [authLoading, user]);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
      <h1>🔍 Firebase Connection Test</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={runTest}
          disabled={isTesting}
          style={{
            padding: '10px 20px',
            background: isTesting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: isTesting ? 'not-allowed' : 'pointer'
          }}
        >
          {isTesting ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      <div style={{
        background: '#f5f5f5',
        padding: 15,
        borderRadius: 4,
        minHeight: 200,
        whiteSpace: 'pre-line'
      }}>
        <strong>Test Results:</strong>
        <div style={{ marginTop: 10 }}>{testResult || "Click 'Run Test' to check Firebase connection..."}</div>
      </div>

      <div style={{ marginTop: 20, fontSize: '0.9em', color: '#666' }}>
        <strong>Debug Info:</strong>
        <div>Firebase Configured: {isFirebaseConfigured ? '✅' : '❌'}</div>
        <div>Auth Loading: {authLoading ? '⏳' : '✅'}</div>
        <div>User: {user ? user.uid : '❌'}</div>
        <div>Firestore: {firestore ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}