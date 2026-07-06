import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import LayoutChrome from "./LayoutChrome";
import { fontBody, fontDisplay } from "./fonts";

export const metadata: Metadata = {
  title: "Synlego",
  description: "Read together. Pass the quiz. Join the discussion.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body>
        <Providers>
          <LayoutChrome>{children}</LayoutChrome>
        </Providers>
      </body>
    </html>
  );
}
