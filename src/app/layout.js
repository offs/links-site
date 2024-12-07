import localFont from "next/font/local";
import "./globals.css";
import { NextAuthProvider } from '@/components/Providers';
import Navbar from '@/components/Navbar';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata = {
  title: "Links Site",
  description: "Your personal links page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body className="bg-[#1a1625] text-white min-h-screen">
        <NextAuthProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}