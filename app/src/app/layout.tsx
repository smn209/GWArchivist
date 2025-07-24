import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header"

export const metadata: Metadata = {
  title: "GW",
  description: "GW",
  icons: {
    icon: '/skills/349.jpg',
    apple: '/skills/349.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
