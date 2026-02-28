import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameClient from './game-client';
import { BookOpen, Layers, ShieldCheck, Globe, GraduationCap, User } from 'lucide-react';
// Import Script dari Next.js untuk AdSense
import Script from 'next/script'; 

interface GameData {
  title: string;
  description: string;
  subject: string;
  class: string;
  authorName: string;
  // Tambahkan field id untuk canonical
  id: string; 
}

// ... fungsi getGameData tetap sama (pastikan return data lengkap) ...

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getGameData(params.id);
  if (!data) return { title: 'Game Tidak Ditemukan' };

  const url = `https://mainq.id/game/${params.id}`; // Sesuaikan domainmu

  return {
    title: `Mainkan ${data.title} - Media Pembelajaran ${data.subject} ${data.class}`,
    description: data.description.substring(0, 160),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: data.title,
      description: data.description,
      url: url,
      siteName: 'MAIN Q',
      locale: 'id_ID',
      type: 'website',
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);
  if (!data) notFound();

  return (
    <article className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 1. Google AdSense Script (Letakkan di sini atau di Layout) */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" // Ganti ID-mu
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* 2. JSON-LD Schema (Lengkap: WebPage + LearningResource) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "LearningResource",
                "name": data.title,
                "description": data.description,
                "learningResourceType": "Educational Game",
                "educationalLevel": data.class,
                "about": data.subject,
                "author": { "@type": "Person", "name": data.authorName }
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainq.id" },
                  { "@type": "ListItem", "position": 2, "name": data.subject, "item": `https://mainq.id/subject/${data.subject.toLowerCase()}` },
                  { "@type": "ListItem", "position": 3, "name": data.title }
                ]
              }
            ]
          }),
        }}
      />

      {/* 3. Header Area (Penting untuk SEO: H1 harus terlihat, jangan sr-only) */}
      <header className="mb-8 border-b pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
          Media Pembelajaran Interaktif: {data.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {data.authorName}</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {data.class}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {data.subject}</span>
        </div>
      </header>

      {/* 4. Slot Iklan Atas (AdSense Placeholder) */}
      <div className="my-6 min-h-[90px] bg-slate-50 flex items-center justify-center border dashed">
        <p className="text-xs text-slate-400 italic">Iklan Atas</p>
      </div>

      {/* 5. Area Game */}
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-8">
        <GameClient id={params.id} />
      </div>

      {/* 6. Konten Deskripsi Panjang (Penting untuk AdSense agar tidak dianggap Low Value) */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Tentang Media Pembelajaran Ini</h2>
            <p>{data.description}</p>
            <p className="mt-4">
              Game edukasi ini dikembangkan untuk membantu siswa memahami materi <strong>{data.subject}</strong> dengan cara yang lebih menyenangkan. 
              Cocok digunakan sebagai media pendukung dalam Kurikulum Merdeka di kelas <strong>{data.class}</strong>.
            </p>
          </section>

          {/* 7. Slot Iklan Tengah Artikel */}
          <div className="my-6 min-h-[250px] bg-slate-50 flex items-center justify-center border dashed">
            <p className="text-xs text-slate-400 italic">Iklan Tengah</p>
          </div>

          <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" /> Manfaat Gamifikasi
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Meningkatkan keterlibatan (engagement) aktif siswa selama KBM.</li>
              <li>Memberikan umpan balik (feedback) instan terhadap pemahaman materi.</li>
              <li>Mempermudah visualisasi konsep abstrak pada mata pelajaran {data.subject}.</li>
            </ul>
          </section>
        </div>

        {/* 8. Sidebar (Bisa diisi link game lain / Iklan Vertical) */}
        <aside className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-bold mb-3 uppercase text-xs tracking-wider">Informasi Tambahan</h4>
            <div className="text-sm space-y-2">
              <p><strong>Kategori:</strong> {data.subject}</p>
              <p><strong>Level:</strong> {data.class}</p>
              <p><strong>Platform:</strong> Web Browser (HTML5)</p>
            </div>
          </div>
          <div className="min-h-[600px] bg-slate-50 flex items-center justify-center border dashed">
            <p className="text-xs text-slate-400 italic">Iklan Sidebar</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
