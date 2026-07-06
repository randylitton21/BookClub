"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import BrandLogo from "./_components/BrandLogo";

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
            <Link href="/" className="brandLink">
              <BrandLogo variant="nav" />
            </Link>

            <nav className="nav">
              {user ? (
                <>
                  <Link href="/app" className="navLink">
                    My Clubs
                  </Link>
                  <Link href="/app/explore" className="navLink">
                    Browse
                  </Link>
                  <Link href="/app/profile" className="navLink">
                    Profile
                  </Link>
                  <button type="button" className="btnGhost btnSmall" onClick={() => signOut()}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/app/login" className="navLink">
                    Sign in
                  </Link>
                  <Link href="/app/login" className="btnPrimary btnSmall">
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className={inApp ? "main main--app" : "main"}>{children}</main>

      {!inApp && (
        <footer className="siteFooter">
          <div className="container siteFooterInner">
            <Link href="/" className="brandLink brandLink--footer">
              <BrandLogo variant="footer" />
            </Link>
            <span className="muted">Read Together</span>
          </div>
        </footer>
      )}
    </>
  );
}
