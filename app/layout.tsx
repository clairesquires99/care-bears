import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { APP_NAME } from "@/src/lib/constants";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Family Conversations`,
  description: "Guided conversations to help families discuss what matters most.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} ${caveat.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
