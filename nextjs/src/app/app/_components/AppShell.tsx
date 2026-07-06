"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { isFirebaseConfigured } from "@/lib/firebaseClient";
import BrandLogo from "../../_components/BrandLogo";

const NAV_ITEMS = [
  { href: "/app", label: "Clubs", icon: ClubsIcon, match: (p: string) => p === "/app" || p.startsWith("/app/clubs") || p.startsWith("/app/readers") },
  { href: "/app/explore", label: "Browse", icon: BrowseIcon, match: (p: string) => p.startsWith("/app/explore") },
  { href: "/app/profile", label: "Profile", icon: ProfileIcon, match: (p: string) => p.startsWith("/app/profile") },
] as const;

function ClubsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrowseIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isRoom = pathname?.includes("/room/");

  return (
    <div className="appShell">
      <header className="appTopBar">
        <Link href="/app" className="brandLink brandLink--app">
          <BrandLogo variant="nav" />
        </Link>
        <nav className="appTopNav" aria-label="Main">
          {NAV_ITEMS.map(({ href, label, match }) => {
            const active = pathname ? match(pathname) : false;
            return (
              <Link
                key={href}
                href={href}
                className={`appTopNavLink${active ? " appTopNavLink--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="appTopBarActions">
          {!isFirebaseConfigured && (
            <span className="muted appTopHint">Demo mode</span>
          )}
          {user && (
            <button type="button" className="btnGhost btnSmall" onClick={() => signOut()}>
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="appMain">{children}</main>

      {!isRoom && (
        <nav className="appBottomNav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = pathname ? match(pathname) : false;
            return (
              <Link
                key={href}
                href={href}
                className={`appBottomNavItem${active ? " appBottomNavItem--active" : ""}`}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
