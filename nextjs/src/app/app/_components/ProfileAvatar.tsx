import { profileInitials } from "@/lib/profileDisplay";

export default function ProfileAvatar({
  displayName,
  photoURL,
  size = "md",
  className = "",
}: {
  displayName: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "profileAvatar--sm" : size === "lg" ? "profileAvatar--lg" : "profileAvatar--md";

  if (photoURL?.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt=""
        className={`profileAvatar profileAvatar--photo ${sizeClass} ${className}`.trim()}
      />
    );
  }

  return (
    <span className={`profileAvatar ${sizeClass} ${className}`.trim()} aria-hidden>
      {profileInitials(displayName)}
    </span>
  );
}
