'use client';

import { Inter, Fredoka } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthButtons } from '@/components/AuthButtons';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Suspense } from 'react';
import { AdSense } from '@/components/AdSense';

// Initialize Inter font for body text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Initialize Fredoka font for headlines
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const MainQLogo = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center", className)}>
        <Image
          src="/logo.png"
          alt="MAIN Q Logo"
          width={100}
          height={45}
          priority
        />
    </div>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${fredoka.variable}`}>
      <head>
        <meta name="google-site-verification" content="hNuCsI-8kIhGijjApCawbZ3MF1_5DN2XxvPL6jZ_rQ8" />
        <meta name="google-adsense-child-directed-treatment" content="true" />
        <meta name="google-adsense-under-age-of-consent" content="true" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics />
            <AdSense />
          </Suspense>
          <div className="flex flex-col min-h-screen">
            <header className="bg-card shadow-sm sticky top-0 z-50">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                  <Link href="/">
                    <MainQLogo />
                  </Link>
                  <nav className="flex items-center gap-2">
                    <AuthButtons />
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
            <footer className="bg-card py-8 mt-8 border-t">
              <div className="container mx-auto px-4 text-center">
                  <div className="flex justify-center mb-4 gap-6 flex-wrap">
                      <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">Tentang Kami</Link>
                      <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Kontak</Link>
                      <Link href="/help" className="text-sm text-muted-foreground hover:text-primary font-bold">Pusat Bantuan</Link>
                      <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Kebijakan Privasi</Link>
                      <Link href="/tutorial" className="text-sm text-muted-foreground hover:text-primary">Tutorial</Link>
                  </div>
                  <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MAIN Q. Dibuat untuk para guru dan siswa.</p>
              </div>
            </footer>
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
