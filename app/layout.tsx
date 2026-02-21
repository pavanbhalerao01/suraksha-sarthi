import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Survive.exe - Disaster Risk Assessment",
  description: "Pre-disaster risk assessment platform for Maharashtra authorities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
