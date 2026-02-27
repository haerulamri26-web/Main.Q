import { Metadata } from 'next';
import GameClient from './game-client';
import { BookOpen, Layers, ShieldCheck, Globe } from 'lucide-react';

interface GameData {
  title: string;
  description: string;
  subject: string;
  class: string;
  authorName: string;
}

// Function to fetch data on the server for SEO
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
    description: data.description || `Mainkan media pembelajaran interaktif ${data.title} untuk ${data.class}. Dibuat oleh ${data.authorName} untuk mendukung Kurikulum Merdeka.`,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);

  const jsonLd = data ? {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "LearningResource"],
    "name": data.title,
    "description": data.description,
    "applicationCategory": "EducationalGame",
    "operatingSystem": "Web",
    "author": {
      "@type": "Person",
      "name": data.authorName
    },
    "learningResourceType": "Educational Game",
    "educationalLevel": data.class,
    "about": data.subject,
    "inLanguage": "id",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Konten Statis untuk SEO (Muncul tanpa JS) */}
      <div className="sr-only">
        <h1>{data?.title}</h1>
        <p>{data?.description}</p>
        <p>Mata Pelajaran: {data?.subject}</p>
        <p>Level: {data?.class}</p>
        <p>Penulis: {data?.authorName}</p>
      </div>

      <GameClient id={params.id} />

      {/* Bagian Teks Informatif (SSR) */}
      <div className="mt-16 max-w-4xl mx-auto border-t pt-12 space-y-12 bg-card/30 p-8 rounded-xl">
        <section className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2 text-primary">
              <BookOpen className="h-6 w-6" />
              Inovasi Pembelajaran Digital
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Media pembelajaran interaktif <strong>{data?.title}</strong> merupakan bagian dari revolusi pendidikan digital di Indonesia. 
              Dirancang khusus untuk mendukung mata pelajaran <strong>{data?.subject}</strong> pada tingkat <strong>{data?.class}</strong>, 
              game ini memanfaatkan teknologi HTML5 untuk memberikan pengalaman belajar yang imersif dan menyenangkan.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2 text-primary">
              <Layers className="h-6 w-6" />
              Sesuai Kurikulum Merdeka
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Dalam semangat <em>Student-Centered Learning</em>, media ini memfasilitasi siswa untuk bereksplorasi secara mandiri. 
              Pemanfaatan gamifikasi dalam pendidikan terbukti meningkatkan retensi memori dan motivasi belajar siswa hingga 60% dibandingkan metode ceramah konvensional.
            </p>
          </div>
        </section>

        <section className="bg-secondary/20 p-6 rounded-lg border border-primary/10">
          <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Keunggulan Media Pembelajaran MAIN Q
          </h3>
          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              Aksesibilitas Universal: Dapat dibuka di smartphone, tablet, maupun laptop tanpa instalasi.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              Keamanan Terjamin: Berjalan dalam lingkungan sandbox yang aman untuk anak-anak.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              Interaktivitas Tinggi: Memberikan feedback instan bagi siswa selama proses belajar.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              Gratis & Terbuka: Mendukung demokratisasi akses pendidikan berkualitas di seluruh Indonesia.
            </li>
          </ul>
        </section>

        <section className="text-center space-y-4">
          <div className="flex justify-center">
            <Globe className="h-10 w-10 text-primary/40" />
          </div>
          <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
            Halaman ini dioptimalkan untuk mesin pencari guna membantu guru dan siswa di seluruh Indonesia menemukan media pembelajaran berkualitas tinggi secara gratis di platform MAIN Q.
          </p>
        </section>
      </div>
    </div>
  );
}
