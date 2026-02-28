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

function generateAutoContent(data: GameData): string {
  const subjectReadable = data.subject.charAt(0).toUpperCase() + data.subject.slice(1).toLowerCase();
  const uploadDate = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '2024';
  
  const customDesc = data.description?.trim() 
    ? `<p class="mt-3 text-gray-700 leading-relaxed">${data.description}</p>` 
    : '';

  return `
    <section class="mt-10 prose prose-indigo max-w-none" itemscope itemtype="https://schema.org/LearningResource">
      <article itemprop="description" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🎮 Tentang Game "${data.title}"</h2>
        <p class="text-gray-700 leading-relaxed text-lg">
          <strong>${data.title}</strong> adalah media pembelajaran interaktif berbasis web 
          untuk mata pelajaran <strong>${subjectReadable}</strong> jenjang ${data.class}. 
          Game ini dirancang untuk membantu siswa memahami konsep ${subjectReadable.toLowerCase()} 
          melalui pendekatan gamifikasi yang menyenangkan, sesuai dengan prinsip Kurikulum Merdeka.
        </p>
        ${customDesc}
      </article>

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
          <strong class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">Update</strong>
          <span class="font-semibold text-gray-800">${uploadDate}</span>
        </div>
      </div>

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

      <!-- FAQ Section: HTML ONLY, no schema markup -->
      <article>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">❓ Pertanyaan Umum</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg text-gray-900">Apakah game ini gratis?</h3>
            <p class="text-gray-700 mt-1">Ya, seluruh game edukasi di MAIN Q dapat diakses dan dimainkan secara <strong>100% gratis</strong> oleh guru, siswa, dan orang tua.</p>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-gray-900">Apakah perlu install aplikasi?</h3>
            <p class="text-gray-700 mt-1">Tidak perlu install apapun! Game berbasis HTML5 sehingga bisa langsung dimainkan di browser modern di laptop, tablet, maupun smartphone.</p>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-gray-900">Cocok untuk kurikulum apa?</h3>
            <p class="text-gray-700 mt-1">Materi game disusun mengacu pada <strong>Capaian Pembelajaran (CP) Kurikulum Merdeka</strong>, sehingga relevan untuk pembelajaran di sekolah Indonesia jenjang ${data.class}.</p>
          </div>
        </div>
      </article>
    </section>
  `;
}

// ✅ FAQPage JSON-LD - PLAIN TEXT ONLY, NO TRAILING SPACES
function generateFAQJsonLd(data: GameData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Apakah game ini gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya, seluruh game edukasi di MAIN Q dapat diakses dan dimainkan secara 100% gratis oleh guru, siswa, dan orang tua."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah perlu install aplikasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tidak perlu install apapun. Game berbasis HTML5 sehingga bisa langsung dimainkan di browser modern seperti Chrome, Edge, Firefox, atau Safari tanpa download."
        }
      },
      {
        "@type": "Question",
        "name": "Cocok untuk kurikulum apa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Materi game disusun mengacu pada Capaian Pembelajaran (CP) Kurikulum Merdeka untuk jenjang " + data.class + "."
        }
      }
    ]
  };
}

// ✅ BreadcrumbList JSON-LD - NO TRAILING SPACES
function generateBreadcrumbJsonLd(data: GameData) {
  const subjectSlug = data.subject.toLowerCase().replace(/\s+/g, '-');
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mainq.my.id" },
      { "@type": "ListItem", "position": 2, "name": "Game Edukasi", "item": "https://mainq.my.id/games" },
      { "@type": "ListItem", "position": 3, "name": data.subject, "item": "https://mainq.my.id/games?subject=" + subjectSlug },
      { "@type": "ListItem", "position": 4, "name": data.title }
    ]
  };
}

// ============================================================================
// DATA FETCHING - NO TRAILING SPACES
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
// METADATA GENERATION - NO TRAILING SPACES
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
      url: canonicalUrl,
      locale: 'id_ID',
      siteName: 'MAIN Q',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: metaDescription,
    },
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getGameData(params.id);
  if (!data) notFound();

  const canonicalUrl = `https://mainq.my.id/game/${params.id}`;
  
  const mainJsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "LearningResource"],
    "name": data.title,
    "description": generateMetaDescription(data),
    "applicationCategory": "EducationalGame",
    "applicationSubCategory": "Educational",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "author": { "@type": "Person", "name": data.authorName },
    "publisher": { "@type": "Organization", "name": "MAIN Q", "url": "https://mainq.my.id" },
    "learningResourceType": "Educational Game",
    "educationalLevel": data.class,
    "educationalUse": "InstructionalMaterial",
    "about": data.subject,
    "inLanguage": "id",
    "offers": { 
      "@type": "Offer", 
      "price": "0",
      "priceCurrency": "IDR", 
      "availability": "https://schema.org/InStock"
    },
    "url": canonicalUrl,
    "isAccessibleForFree": true,
    "datePublished": data.createdAt || new Date().toISOString(),
    "dateModified": new Date().toISOString(),
  };

  const faqJsonLd = generateFAQJsonLd(data);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(data);

  return (
    <>
      {/* AdSense Script - NO TRAILING SPACES */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8378725062743955"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {/* JSON-LD 1: Main Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(mainJsonLd)
        }} 
      />
      
      {/* JSON-LD 2: FAQPage */}
      
      {/* JSON-LD 3: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd)
        }} 
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <GameClient id={params.id} />
        </article>
        
        {/* Auto-Generated SEO Content */}
        <div 
          className="mt-10 text-gray-800"
          dangerouslySetInnerHTML={{ __html: generateAutoContent(data) }} 
        />
        
        {/* Attribution */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className="font-semibold text-gray-900">Dibuat oleh: {data.authorName}</p>
              <p className="text-sm text-gray-600">Guru mitra MAIN Q • Konten telah diverifikasi</p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <span>🎮</span> Jelajahi Game Edukasi Lainnya
          </a>
        </div>
      </main>
    </>
  );
}
