import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Whiteboard infinita";
const DESCRIPTION = "Lavagna infinita: disegna, scrivi, sposta e fai zoom senza limiti.";

export const metadata: Metadata = {
  // Imposta NEXT_PUBLIC_SITE_URL (es. https://tuodominio.it) in produzione
  // così le immagini di anteprima hanno URL assoluti.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: TITLE, template: `%s · ${TITLE}` },
  description: DESCRIPTION,
  applicationName: TITLE,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: { capable: true, title: TITLE, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full">
      <body className={`${geistMono.className} h-full overflow-hidden antialiased`}>{children}</body>
    </html>
  );
}
