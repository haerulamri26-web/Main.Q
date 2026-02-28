import { Metadata } from 'next';
import HomeClient from './home-client';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'MAIN Q - Platform Game Edukasi & Media Pembelajaran Interaktif No. 1',
  description: 'Mainkan 500+ game edukasi gratis untuk SD, SMP, SMA. Media pembelajaran interaktif untuk guru dan siswa Indonesia. Belajar matematika, IPA, dan sejarah jadi lebih seru!',
  keywords: ['game edukasi', 'media pembelajaran interaktif', 'main q', 'belajar seru', 'game sekolah', 'kuis interaktif'],
  openGraph: {
    title: 'MAIN Q - Belajar Seru dengan Game Edukasi',
    description: 'Platform media pembelajaran interaktif gratis untuk siswa dan guru di Indonesia.',
    url: 'https://mainq.my.id',
    siteName: 'MAIN Q',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MAIN Q",
    "url": "https://mainq.my.id",
    "description": "Platform game edukasi dan media pembelajaran interaktif nomor 1 di Indonesia.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Script AdSense - Ganti dengan ID asli Anda */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <HomeClient />
    </>
  );
}
