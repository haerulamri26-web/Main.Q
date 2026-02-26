import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'MAIN Q: Platform Game Edukasi HTML5',
  description: 'Temukan ribuan game edukasi HTML5 buatan guru di MAIN Q. Platform untuk belajar sambil bermain.',
};

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
    <html lang="id">
      <head>
        <meta name="google-site-verification" content="hNuCsI-8kIhGijjApCawbZ3MF1_5DN2XxvPL6jZ_rQ8" />
        <meta name="google-adsense-child-directed-treatment" content="true" />
        <meta name="google-adsense-under-age-of-consent" content="true" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Fredoka:wght@700&display=swap" rel="stylesheet" />
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
            <main className="flex-1 animate-in fade-in-0 duration-500">
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
