import type { Metadata } from "next";
import { Inter, Lora, Poppins } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Clearpiece",
    template: "%s | Clearpiece",
  },
  description: "Clearpiece glass jars, bottles, and premium packaging storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${lora.variable} ${poppins.variable}`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="site-shell">
            <SiteHeader />
            <main className="main-content">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
