import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stanford Voice AI Workshop',
  description:
    'Live Vapi call controls, transcripts, and UI patterns for the Stanford Voice AI session.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <div className="relative flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
