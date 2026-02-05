import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthButtons } from '@/components/AuthButtons';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: 'MAIN Q: Website Interaktif & Platform Game Edukasi',
  description: 'Temukan ribuan game di MAIN Q, website interaktif terdepan untuk belajar sambil bermain. Platform game edukasi yang dibuat oleh guru untuk siswa di seluruh Indonesia.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Fredoka:wght@700&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8378725062743955"
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <GoogleAnalytics />
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
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                <div className="flex justify-center gap-6 mb-4">
                  <Link href="/about" className="text-sm hover:text-primary hover:underline">Tentang Kami</Link>
                  <Link href="/contact" className="text-sm hover:text-primary hover:underline">Kontak</Link>
                  <Link href="/privacy" className="text-sm hover:text-primary hover:underline">Kebijakan Privasi</Link>
                </div>
                <p className="text-sm">&copy; {new Date().getFullYear()} MAIN Q. Dibuat untuk guru dan siswa.</p>
              </div>
            </footer>
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
