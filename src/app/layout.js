import "./globals.css";
import { NextAuthProvider } from '@/components/Providers';
import Header from '@/components/Header';
import localFont from 'next/font/local';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: '--font-geist-sans',
});

export const metadata = {
  title: "Links Site",
  description: "Share all your important links in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="bg-[#1a1625] text-white">
        <NextAuthProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}