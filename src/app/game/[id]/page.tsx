import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameClient from './game-client';
import Script from 'next/script';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface GameData {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  authorName: string;
  createdAt?: string;
}

// ============================================================================
// HELPER FUNCTIONS (Auto-Enrichment System)
// ============================================================================

/**
 * Generate SEO-friendly meta description dengan fallback cerdas
 */
function generateMetaDescription(data: GameData): string {
  const cleanDesc = data.description?.trim();
  
  if (cleanDesc && cleanDesc.length >= 140) {
    return cleanDesc.length <= 160 ? cleanDesc : cleanDesc.substring(0, 157) + '...';
  }
  
  const subjectMap: Record<string, string> = {
    'matematika': 'Matematika',
    'agama': 'Pendidikan Agama & Budi Pekerti',
    'ipa': 'Ilmu Pengetahuan Alam (IPA)',
    'ips': 'Ilmu Pengetahuan Sosial (IPS)',
    'bahasa': 'Bahasa Indonesia',
    'ppkn': 'Pendidikan Pancasila & Kewarganegaraan',
    'seni': 'Seni Budaya & Prakarya',
  };
  
  const subjectReadable = subjectMap[data.subject?.toLowerCase()] || data.subject;
  
  return `Mainkan game edukasi interaktif "${data.title}" untuk pelajaran ${subjectReadable} ${data.class}. Media pembelajaran HTML5 sesuai Kurikulum Merdeka. Gratis, tanpa install, cocok untuk belajar di rumah & sekolah. Dibuat oleh guru Indonesia.`;
}

/**
 * Generate auto-content HTML block untuk SEO text di bawah game iframe
 */
function generateAutoContent(data: GameData): string {
  const subjectReadable = data.subject.charAt(0).toUpperCase() + data.subject.slice(1).toLowerCase();
  
  const uploadYear = data.createdAt 
    ? new Date(data.createdAt).getFullYear().toString()
    : new Date().getFullYear().toString();
  
  const customDesc = data.description?.trim() 
    ? `<p class="mt-3 text-gray-700 leading-relaxed">${data.description}</p>` 
    : '';

  return `
    <section class="mt-10 prose prose-indigo max-w-none" itemScope itemType="https://schema.org/LearningResource">
      
      <!-- Section 1: Pengantar Otomatis -->
      <article itemProp="description" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🎮 Tentang Game "${data.title}"</h2>
        <p class="text-gray-700 leading-relaxed text-lg">
          <strong>${data.title}</strong> adalah media pembelajaran interaktif berbasis web 
          untuk mata pelajaran <strong>${subjectReadable}</strong> jenjang ${data.class}. 
          Game ini dirancang untuk membantu siswa memahami konsep ${subjectReadable.toLowerCase()} 
          melalui pendekatan gamifikasi yang menyenangkan, sesuai dengan prinsip Kurikulum Merdeka.
        </p>
        ${customDesc}
      </article>

      <!-- Section 2: Info Teknis (Grid) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
        <div class="text-center">
          <span class="text-2xl">🎯</span>
          <strong class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">Mapel</strong>
          <span class="font-semibold text-gray-800">${subjectReadable}</span>
        </div>
        <div class="text-center">
          <span class="text-2xl">📚</span>
          <strong class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">Jenjang</strong>
          <span class="font-semibold text-gray-800">${data.class}</span>
        </div>
        <div class="text-center">
          <span class="text-2xl">💻</span>
          <strong class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">Platform</strong>
          <span class="font-semibold text-gray-800">HTML5 Web</span>
        </div>
        <div class="text-center">
          <span class="text-2xl">🔄</span>
          <strong class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">Tahun</strong>
          <span class="font-semibold text-gray-800">${uploadYear}</span>
        </div>
      </div>

      <!-- Section 3: Panduan untuk Guru & Orang Tua -->
      <article class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">💡 Cara Menggunakan di Kelas</h2>
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <ol class="list-decimal list-inside space-y-3 text-gray-700 text-base">
            <li><strong class="text-gray-900">Persiapan:</strong> Buka halaman ini di laptop, tablet, atau HP siswa. Pastikan koneksi internet stabil.</li>
            <li><strong class="text-gray-900">Instruksi Awal:</strong> Klik tombol "Mulai Main" dan jelaskan tujuan pembelajaran kepada siswa sebelum memulai.</li>
            <li><strong class="text-gray-900">Proses Bermain:</strong> Biarkan siswa mengeksplorasi game secara mandiri, dampingi jika ada kesulitan teknis.</li>
            <li><strong class="text-gray-900">Refleksi:</strong> Setelah selesai, ajak siswa berdiskusi tentang materi yang dipelajari dan hubungkan dengan kehidupan nyata.</li>
          </ol>
        </div>
      </article>

      <!-- Section 4: FAQ dengan Schema Markup -->
      <article itemScope itemType="https://schema.org/FAQPage">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">❓ Pertanyaan Umum</h2>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" class="mb-5 pb-5 border-b border-gray-100">
          <h3 itemProp="name" class="font-semibold text-lg text-gray-900">Apakah game ini gratis?</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text" class="text-gray-700 mt-2">Ya, seluruh game edukasi di MAIN Q dapat diakses dan dimainkan secara <strong>100% gratis</strong> oleh guru, siswa, dan orang tua. Tidak ada biaya tersembunyi.</p>
          </div>
        </div>

        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" class="mb-5 pb-5 border-b border-gray-100">
          <h3 itemProp="name" class="font-semibold text-lg text-gray-900">Apakah perlu install aplikasi?</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text" class="text-gray-700 mt-2">Tidak perlu install apapun! Game berbasis HTML5 sehingga bisa langsung dimainkan di browser modern (Chrome, Edge, Firefox, Safari) di laptop, tablet, maupun smartphone.</p>
          </div>
        </div>

        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name" class="font-semibold text-lg text-gray-900">Cocok untuk kurikulum apa?</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text" class="text-gray-700 mt-2">Materi game disusun mengacu pada <strong>Capaian Pembelajaran (CP) Kurikulum Merdeka</strong>, sehingga relevan untuk pembelajaran di sekolah Indonesia jenjang ${data.class}.</p>
          </div>
        </div>
      </article>
      
    </section>
  `;
}

/**
 * Generate BreadcrumbList JSON-LD
 */
function generateBreadcrumbJsonLd(data: GameData) {
  const subjectSlug = data.subject.toLowerCase().replace(/\s+/g, '-');
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainq.my.id" },
      { "@type": "ListItem", "position": 2, "name": "Game Edukasi", "item": "https://mainq.my.id" },
      { "@type": "ListItem", "position": 3, "name": data.subject, "item": `https://mainq.my.id/?subject=${subjectSlug}` },
      { "@type": "ListItem", "position": 4, "name": data.title }
    ]
  };
}

// ============================================================================
// DATA FETCHING
// ============================================================================
async function getGameData(id: string): Promise<GameData | null> {
  try {
    const projectId = "studio-7363006266-37b51";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/publishedGames/${id}`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    
    const data = await res.json();
    const fields = data.fields;
    
    return {
      id,
      title: fields.title?.stringValue || 'Game Edukasi',
      description: fields.description?.stringValue || '',
      subject: fields.subject?.stringValue || 'Umum',
      class: fields.class?.stringValue || 'Semua Level',
      authorName: fields.authorName?.stringValue || 'Guru Kreatif',
      createdAt: fields.createdAt?.timestampValue,
    };
  } catch (e) {
    console.error('❌ Error fetching game data:', e);
    return null;
  }
}

// ============================================================================
// METADATA GENERATION (SEO)
// ============================================================================
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getGameData(params.id);
  
  if (!data) {
    return {
      title: 'Game Tidak Ditemukan - MAIN Q',
      description: 'Halaman game yang Anda cari tidak tersedia.',
    };
  }

  const metaDescription = generateMetaDescription(data);
  const canonicalUrl = `https://mainq.my.id/game/${params.id}`;

  return {
    title: `${data.title} - Game Edukasi ${data.subject} ${data.class} | MAIN Q`,
    description: metaDescription,
    keywords: [data.title, data.subject, data.class, 'game edukasi', 'media pembelajaran', 'kurikulum merdeka'].join(', '),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: data.title,
      description: metaDescription,
      type: 'article',
      siteName: 'MAIN Q',
      locale: 'id_ID',
      url: canonicalUrl,
    },
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);
  
  if (!data) {
    notFound();
  }

  const mainJsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "LearningResource"],
    "name": data.title,
    "description": generateMetaDescription(data),
    "applicationCategory": "EducationalGame",
    "operatingSystem": "Web",
    "author": { "@type": "Person", "name": data.authorName },
    "publisher": { "@type": "Organization", "name": "MAIN Q", "url": "https://mainq.my.id" },
    "learningResourceType": "Educational Game",
    "educationalLevel": data.class,
    "about": data.subject,
    "inLanguage": "id",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" },
    "url": `https://mainq.my.id/game/${params.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mainJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbJsonLd(data)) }}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <GameClient id={params.id} />
        
        <div 
          className="mt-10 text-gray-800"
          dangerouslySetInnerHTML={{ __html: generateAutoContent(data) }} 
        />
        
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className="font-semibold text-gray-900">Dibuat oleh: {data.authorName}</p>
              <p className="text-sm text-gray-600">Guru mitra MAIN Q • Konten telah diverifikasi</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <span>🎮</span>
            Jelajahi Game Edukasi Lainnya
          </a>
        </div>
      </main>
    </>
  );
}