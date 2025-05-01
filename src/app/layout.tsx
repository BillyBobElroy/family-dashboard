// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Family Dashboard',
  description: 'A shared space for family planning, tasks, meals, and memories.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-gray-50 text-gray-900'}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
