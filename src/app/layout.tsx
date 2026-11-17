import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "A workspace for writing and editing documents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
