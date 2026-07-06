import { bookCoverInitials, bookCoverPalette } from "@/lib/bookCoverStyle";

type BookCoverSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<BookCoverSize, string> = {
  sm: "bookCover--sm",
  md: "bookCover--md",
  lg: "bookCover--lg",
};

export default function BookCover({
  title,
  size = "md",
  className = "",
}: {
  title: string;
  size?: BookCoverSize;
  className?: string;
}) {
  const { bg, accent } = bookCoverPalette(title);
  const initials = bookCoverInitials(title);

  return (
    <div
      className={`bookCover ${SIZE_CLASS[size]} ${className}`.trim()}
      style={{ "--cover-bg": bg, "--cover-accent": accent } as React.CSSProperties}
      aria-hidden
    >
      <span className="bookCoverSpine" />
      <span className="bookCoverInitials">{initials}</span>
      <span className="bookCoverSheen" />
    </div>
  );
}
