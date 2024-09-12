import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Ober",
  description: "Get your friends to drive you around guilt-free and fair.",
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
  );
}
