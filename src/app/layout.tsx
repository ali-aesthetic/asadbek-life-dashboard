import type { Metadata } from "next";
import { Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Asadbek's Dashboard",
  description: "Personal life management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
