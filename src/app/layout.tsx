import type { Metadata } from 'next';
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
import Script from 'next/script';
import { metadata as siteMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './metadata';

// ============================================================================
// FONT INITIALIZATION
// ============================================================================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const metadata: Metadata = siteMetadata;

// ============================================================================
// HELPER: Generate Global JSON-LD Schema
// ============================================================================
function generateGlobalJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo.png`,
          "width": 600,
          "height": 60
        },
        "sameAs": [
          "https://www.facebook.com/mainq",
          "https://www.instagram.com/mainq",
          "https://www.youtube.com/@mainq"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "haerulamri26@gmail.com",
          "areaServed": "ID",
          "availableLanguage": "Indonesian"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        "url": SITE_URL,
        "name": SITE_NAME,
        "description": SITE_DESCRIPTION,
        "inLanguage": "id-ID",
        "publisher": { "@id": `${SITE_URL}#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/games?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "EducationalOrganization",
        "name": SITE_NAME,
        "description": "Platform berbagi media pembelajaran interaktif untuk guru Indonesia",
        "educationalLevel": ["SD", "SMP", "SMA"],
        "availableLanguage": "id",
        "url": SITE_URL,
        "knowsAbout": [
          "Game Edukasi",
          "Media Pembelajaran",
          "Kurikulum Merdeka",
          "Pembelajaran Interaktif",
          "Gamifikasi Pendidikan"
        ]
      }
    ]
  };
}

// ============================================================================
// LOGO COMPONENT
// ============================================================================
const MainQLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center", className)}>
    <Image
      src="/logo.png"
      alt="MAIN Q Logo"
      width={100}
      height={45}
      priority
      sizes="(max-width: 768px) 100px, 100px"
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
        {/* Meta Tags Global */}
        <meta name="google-adsense-child-directed-treatment" content="true" />
        <meta name="google-adsense-under-age-of-consent" content="true" />
        
        {/* Open Graph Defaults */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mainq" />
        
        {/* JSON-LD Global Schema */}
        <Script
          id="global-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(generateGlobalJsonLd()) 
          }}
          strategy="afterInteractive"
        />
        
        {/* Preconnect untuk performa */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      </head>
      
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics />
            <AdSense />
          </Suspense>
          
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-card shadow-sm sticky top-0 z-50">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                  <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
                    <MainQLogo />
                  </Link>
                  <nav className="flex items-center gap-2">
                    <AuthButtons />
                  </nav>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Toast Notifications */}
            <Toaster />
            
            {/* Footer */}
            <footer className="bg-card py-8 mt-8 border-t" itemScope itemType="https://schema.org/WPFooter">
              <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center mb-4 gap-6 flex-wrap" itemScope itemType="https://schema.org/SiteNavigationElement">
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors" itemProp="url">Tentang Kami</Link>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors" itemProp="url">Kontak</Link>
                  <Link href="/help" className="text-sm text-muted-foreground hover:text-primary font-bold transition-colors" itemProp="url">Pusat Bantuan</Link>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors" itemProp="url">Kebijakan Privasi</Link>
                  <Link href="/tutorial" className="text-sm text-muted-foreground hover:text-primary transition-colors" itemProp="url">Tutorial</Link>
                </div>
                <p className="text-sm text-muted-foreground" itemProp="copyrightYear">
                  &copy; {new Date().getFullYear()} {SITE_NAME}. Dibuat untuk para guru dan siswa.
                </p>
                <span itemProp="copyrightHolder" itemScope itemType="https://schema.org/Organization" className="sr-only">
                  <span itemProp="name">{SITE_NAME}</span>
                </span>
              </div>
            </footer>
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
