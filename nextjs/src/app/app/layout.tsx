"use client";

import { usePathname } from "next/navigation";
import RequireAuth from "./_components/RequireAuth";
import AppShell from "./_components/AppShell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLogin = pathname === "/app/login";

  if (isLogin) {
    return <div className="authPageWrap">{children}</div>;
  }

  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
