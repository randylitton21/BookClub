"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseReturnNav } from "@/lib/returnNav";

function ReturnNavButtonInner({
  fallbackHref,
  fallbackLabel,
}: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const searchParams = useSearchParams();
  const nav = parseReturnNav(searchParams);
  const href = nav?.returnTo ?? fallbackHref;
  const label = nav?.returnLabel ?? fallbackLabel;

  return (
    <Link href={href} className="btnGhost btnSmall">
      ← Back to {label}
    </Link>
  );
}

export default function ReturnNavButton(props: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  return (
    <Suspense
      fallback={
        <Link href={props.fallbackHref} className="btnSecondary">
          Back to {props.fallbackLabel}
        </Link>
      }
    >
      <ReturnNavButtonInner {...props} />
    </Suspense>
  );
}
