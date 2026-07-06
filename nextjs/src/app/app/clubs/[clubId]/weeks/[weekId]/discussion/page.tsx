import { redirect } from "next/navigation";

export default async function DiscussionRedirectPage({
  params,
}: {
  params: Promise<{ clubId: string; weekId: string }>;
}) {
  const { clubId, weekId } = await params;
  redirect(`/app/clubs/${clubId}/room/${weekId}`);
}
