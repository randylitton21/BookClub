"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const inApp = pathname?.startsWith("/app");

  return (
    <>
      {!inApp && (
        <header className="siteHeader">
          <div className="container siteHeaderInner">
            <div className="brand">
              <Link href="/" className="brandLink">
                Book Club
              </Link>
            </div>

            <nav className="nav">
              {user ? (
                <>
                  <Link href="/app" className="navLink">
                    My Clubs
                  </Link>
                  <Link href="/app/profile" className="navLink">
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="navCta"
                    onClick={() => signOut()}
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/app/login" className="navLink">
                    Sign in
                  </Link>
                  <Link href="/app/login" className="navCta">
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className="main">{children}</main>

      {!inApp && (
        <footer className="siteFooter">
          <div className="container siteFooterInner">
            <span>Book Club</span>
            <span className="muted">Proof of concept</span>
          </div>
        </footer>
      )}
    </>
  );
}
