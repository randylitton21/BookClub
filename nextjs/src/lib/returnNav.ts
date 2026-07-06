/** Query params for contextual back navigation between app screens. */
export const BROWSE_BOOKS_RETURN = {
  returnTo: "/app/explore",
  returnLabel: "Browse books",
} as const;

export function buildReturnNavQuery(returnTo: string, returnLabel: string): string {
  const params = new URLSearchParams();
  params.set("returnTo", returnTo);
  params.set("returnLabel", returnLabel);
  return `?${params.toString()}`;
}

export function hrefWithReturnNav(
  path: string,
  returnTo: string,
  returnLabel: string
): string {
  return `${path}${buildReturnNavQuery(returnTo, returnLabel)}`;
}

export function parseReturnNav(
  searchParams: Pick<URLSearchParams, "get">
): { returnTo: string; returnLabel: string } | null {
  const returnTo = searchParams.get("returnTo");
  const returnLabel = searchParams.get("returnLabel");
  if (!returnTo || !returnLabel) return null;
  if (!returnTo.startsWith("/app")) return null;
  return { returnTo, returnLabel };
}
