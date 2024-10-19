import type { Metadata } from "next";
import styles from "./page.module.css";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Best New Music",
  description: "NPR's New Music Listings With Samples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="mx-8 my-8">
          <h1 className={styles.pageTitle}>
            New Music Albums from{" "}
            <a
              className={styles.link}
              href="https://www.npr.org/sections/allsongs/606254804/new-music-friday"
            >
              NPR New Music Friday
            </a>
          </h1>
          {children}
        </main>
      </body>
    </html>
  );
}
