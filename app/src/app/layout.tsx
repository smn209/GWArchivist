import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GW Archivist",
  description: "GW Archivist - Guild Vs Guild matches history.",
  icons: {
    icon: '/icons/The_Frog.png',
    apple: '/icons/The_Frog.png',
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
        {children}
      </body>
    </html>
  )
}
