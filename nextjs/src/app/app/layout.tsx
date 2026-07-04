"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { isFirebaseConfigured } from "@/lib/firebaseClient";
import RequireAuth from "./_components/RequireAuth";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const isLogin = pathname === "/app/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <RequireAuth>
      <div className="container">
        <header className="appSubHeader">
          <Link href="/app" className="brandLink">
            Book Club
          </Link>
          <nav className="appSubNav">
            <Link href="/app" className="navLink">
              Clubs
            </Link>
            <Link href="/app/profile" className="navLink">
              Profile
            </Link>
            {!isFirebaseConfigured && (
              <span className="muted" style={{ fontSize: 13 }}>
                Firebase not configured
              </span>
            )}
            {user && (
              <button type="button" className="btnSecondary btnSmall" onClick={() => signOut()}>
                Sign out
              </button>
            )}
          </nav>
        </header>
        {!isLoading && user && (
          <p className="muted appSignedInAs">Signed in as {user.email}</p>
        )}
        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </RequireAuth>
  );
}
