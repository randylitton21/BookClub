"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hrefWithReturnNav } from "@/lib/returnNav";

export default function ReaderProfileLink({
  uid,
  children,
  className = "",
  returnTo,
  returnLabel,
}: {
  uid: string;
  children: React.ReactNode;
  className?: string;
  returnTo?: string;
  returnLabel?: string;
}) {
  const pathname = usePathname();
  const backTo = returnTo ?? pathname ?? "/app";
  const backLabel = returnLabel ?? "Back";
  const href = hrefWithReturnNav(`/app/readers/${uid}`, backTo, backLabel);

  return (
    <Link href={href} className={`readerProfileLink ${className}`.trim()}>
      {children}
    </Link>
  );
}
