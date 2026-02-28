import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameClient from './game-client';
import Script from 'next/script';

interface GameData {
  title: string;
  description: string;
  subject: string;
  class: string;
  authorName: string;
}

async function getGameData(id: string): Promise<GameData | null> {
  try {
    const projectId = "studio-7363006266-37b51";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/publishedGames/${id}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const fields = data.fields;
    return {
      title: fields.title?.stringValue || 'Game Edukasi',
      description: fields.description?.stringValue || '',
      subject: fields.subject?.stringValue || 'Umum',
      class: fields.class?.stringValue || 'Semua Level',
      authorName: fields.authorName?.stringValue || 'Guru Kreatif',
    };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getGameData(params.id);
  if (!data) return { title: 'Game Tidak Ditemukan - MAIN Q' };

  return {
    title: `${data.title} - Game Edukasi ${data.subject} ${data.class} | MAIN Q`,
    description: data.description.substring(0, 160) || `Mainkan media pembelajaran interaktif ${data.title}.`,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      siteName: 'MAIN Q',
      locale: 'id_ID',
    },
    alternates: {
      canonical: `https://mainq.id/game/${params.id}`, // Sesuaikan domain Anda
    }
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "LearningResource"],
    "name": data.title,
    "description": data.description,
    "applicationCategory": "EducationalGame",
    "operatingSystem": "Web",
    "author": { "@type": "Person", "name": data.authorName },
    "learningResourceType": "Educational Game",
    "educationalLevel": data.class,
    "about": data.subject,
    "inLanguage": "id",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" }
  };

  return (
    <>
      {/* Script AdSense - Ganti ID dengan milik Anda */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-6">
        <GameClient id={params.id} />
      </main>
    </>
  );
}
