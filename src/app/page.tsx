'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Eye, User, GraduationCap, UploadCloud, Gamepad2, School, Globe, ChevronLeft, ChevronRight, BookOpen, Search } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Script from 'next/script';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './metadata';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface Game {
  id: string;
  title: string;
  description: string;
  uploadDate: any;
  htmlCode: string;
  class: string;
  subject: string;
  views: number;
  authorName: string;
  userId: string;
  thumbnail?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const GAMES_PER_PAGE = 12;

// ============================================================================
// HELPER: Generate Homepage JSON-LD Schema
// ============================================================================
function generateHomepageJsonLd() {
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
            "urlTemplate": `${SITE_URL}/?search={search_term_string}`
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
// MAIN COMPONENT
// ============================================================================
export default function Home() {
  const firestore = useFirestore();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const gamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'publishedGames'), 
      orderBy('uploadDate', 'desc'), 
    );
  }, [firestore]);

  const { data: games, isLoading, error } = useCollection<Game>(gamesQuery);

  const uniqueSubjects = useMemo(() => {
    if (!games) return [];
    return [...new Set(games.map(game => game.subject).filter(sub => sub && sub.trim() !== ''))].sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(game => {
      const levelMatch = selectedLevel === 'all' || game.class.includes(selectedLevel);
      const subjectMatch = selectedSubject === 'all' || game.subject === selectedSubject;
      const searchMatch = searchQuery === '' || 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return levelMatch && subjectMatch && searchMatch;
    });
  }, [games, selectedLevel, selectedSubject, searchQuery]);

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel, selectedSubject, searchQuery]);

  const GameCardSkeleton = () => (
    <Card className="flex flex-col overflow-hidden border">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </Card>
  );

  return (
    <>
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(generateHomepageJsonLd()) 
        }}
        strategy="afterInteractive"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8 md:py-12">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">
              Belajar Lebih Seru
              <br />
              dengan <span className="text-primary">Game Edukasi Interaktif</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              Mainkan simulasi TKA, kuis, dan game pembelajaran untuk SD, SMP, dan SMA. Cocok untuk latihan siswa dan media ajar guru di Indonesia.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Cari game edukasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg">
                <Link href="#semua-game">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Mulai Main Sekarang
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/upload">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Unggah Game
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              500+ game edukasi · Gratis · Tanpa instalasi tambahan · Aman untuk anak
            </p>
          </div>
          
          <div className="flex justify-center items-center">
            <Image
              src="https://picsum.photos/seed/classroom-illustration/600/500"
              width={600}
              height={500}
              alt="Guru dan siswa belajar menggunakan media interaktif"
              className="rounded-lg shadow-xl"
              priority
              data-ai-hint="teacher students"
            />
          </div>
        </section>

        {/* Main Content Section */}
        <section id="semua-game" className="scroll-mt-20 mt-8 md:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Jelajahi Game Edukasi Berdasarkan Kategori</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Temukan berbagai macam permainan interaktif mulai dari kuis Matematika, simulasi IPA, hingga petualangan Sejarah untuk membantu proses belajar mengajar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Button onClick={() => setSelectedLevel('all')} variant={selectedLevel === 'all' ? 'default' : 'outline'} size="lg">
                Semua Level
            </Button>
            <Button onClick={() => setSelectedLevel('SD')} variant={selectedLevel === 'SD' ? 'default' : 'outline'} size="lg">
                Kelas SD
            </Button>
            <Button onClick={() => setSelectedLevel('SMP')} variant={selectedLevel === 'SMP' ? 'default' : 'outline'} size="lg">
                <GraduationCap className="mr-2 h-4 w-4" /> Kelas SMP
            </Button>
            <Button onClick={() => setSelectedLevel('SMA')} variant={selectedLevel === 'SMA' ? 'default' : 'outline'} size="lg">
                <GraduationCap className="mr-2 h-4 w-4" /> Kelas SMA
            </Button>
            <div className="ml-auto w-full sm:w-auto">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[240px]" size="lg">
                        <SelectValue placeholder="Semua Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                        {uniqueSubjects.map((sub, index) => (
                        <SelectItem key={`${sub}-${index}`} value={sub}>{sub}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div>
            {error && <p className="text-destructive text-center py-8 font-semibold">Gagal memuat daftar game: {error.message}</p>}
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => <GameCardSkeleton key={i} />)}
              </div>
            ) : paginatedGames.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedGames.map((game) => (
                    <Card key={game.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border">
                      <div className="relative aspect-video overflow-hidden border-b bg-gray-800">
                        <iframe
                          srcDoc={game.htmlCode}
                          title={`Pratinjau ${game.title}`}
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          scrolling="no"
                          loading="lazy"
                        />
                        <Link
                          href={`/game/${game.id}`}
                          className="absolute inset-0"
                          aria-label={`Mainkan game ${game.title}`}
                        />
                        <Badge className="absolute top-2 left-2 bg-black/50 text-white backdrop-blur-sm border-transparent">{game.class}</Badge>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-medium text-foreground">{game.subject}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Eye className="h-4 w-4" />
                            <span>{game.views || 0}</span>
                          </div>
                        </div>

                        <h3 className="font-semibold leading-snug truncate mb-1 group-hover:text-primary">{game.title}</h3>
                        
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                          <User className="h-4 w-4" />
                          <span className="truncate">Oleh {game.authorName}</span>
                        </div>
                        
                        <div className="mt-auto">
                          <Button asChild className="w-full">
                            <Link href={`/game/${game.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Mainkan Sekarang
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Berikutnya
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-16 bg-card border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold">Tidak ada game yang cocok dengan kriteria Anda.</h3>
                <p>Coba gunakan filter kelas, mata pelajaran, atau kata kunci yang berbeda.</p>
                <Button variant="link" onClick={() => {setSelectedLevel('all'); setSelectedSubject('all'); setSearchQuery('');}} className="mt-2">
                  Reset Filter
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Feature Section */}
        <section className="mt-16 md:mt-24 mb-16 space-y-12">
          <h2 className="text-3xl font-bold font-headline text-center">Kenapa Memilih {SITE_NAME}?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <School className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-headline mb-2 text-foreground">Bagi Guru Kreatif</h3>
              <p className="text-muted-foreground">Bagikan materi ajar dalam format game interaktif dengan mudah. Ciptakan pengalaman belajar yang tak terlupakan bagi siswa tanpa perlu keahlian coding yang rumit.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent/20 p-4 rounded-full mb-4">
                <GraduationCap className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-headline mb-2 text-foreground">Bagi Siswa Aktif</h3>
              <p className="text-muted-foreground">Ubah cara belajarmu! Jelajahi ribuan game dari berbagai mata pelajaran, mulai dari Matematika hingga Sejarah, yang dibuat langsung oleh guru di Indonesia.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-500/10 p-4 rounded-full mb-4">
                <Globe className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold font-headline mb-2 text-foreground">Akses Gratis & Terbuka</h3>
              <p className="text-muted-foreground">{SITE_NAME} adalah platform terbuka dan gratis untuk semua. Misi kami adalah mendemokratisasi pendidikan yang berkualitas dan menyenangkan bagi setiap anak bangsa.</p>
            </div>
          </div>
        </section>

        {/* SEO Text Block */}
        <section className="bg-card border p-8 rounded-lg mt-16">
          <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
            <BookOpen className="text-primary" />
            Platform Media Pembelajaran Interaktif Nomor 1
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground leading-relaxed">
            <p>
              {SITE_NAME} hadir sebagai solusi inovatif bagi dunia pendidikan di Indonesia. Kami menyediakan ribuan permainan edukasi yang dirancang khusus untuk memenuhi kebutuhan kurikulum sekolah dasar hingga menengah atas. Dengan integrasi teknologi web modern, setiap konten di {SITE_NAME} dapat diakses tanpa perlu melakukan instalasi aplikasi tambahan, cukup melalui browser di smartphone atau laptop.
            </p>
            <p>
              Kami mendukung penuh para guru untuk mentransformasikan materi ajar statis menjadi simulasi interaktif yang menarik. Mulai dari praktikum lab virtual fisika, kuis sejarah yang menegangkan, hingga latihan logika matematika, semuanya tersedia di sini untuk meningkatkan motivasi dan daya serap belajar siswa.
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">🎯 Fitur Utama {SITE_NAME}:</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">✅ Game HTML5 interaktif tanpa install</li>
              <li className="flex items-center gap-2">✅ Sesuai Kurikulum Merdeka</li>
              <li className="flex items-center gap-2">✅ Untuk SD, SMP, dan SMA</li>
              <li className="flex items-center gap-2">✅ Dibuat oleh guru Indonesia</li>
              <li className="flex items-center gap-2">✅ Gratis dan aman untuk anak</li>
              <li className="flex items-center gap-2">✅ Bisa dimainkan di HP, tablet, atau laptop</li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold font-headline text-center">❓ Pertanyaan Umum</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: `Apakah ${SITE_NAME} benar-benar gratis?`, a: `Ya, seluruh fitur di ${SITE_NAME} dapat diakses 100% gratis oleh guru, siswa, dan orang tua. Tidak ada biaya tersembunyi atau langganan.` },
              { q: "Apakah perlu install aplikasi?", a: "Tidak perlu! Semua game berbasis HTML5 sehingga bisa langsung dimainkan di browser modern (Chrome, Edge, Firefox, Safari) tanpa download." },
              { q: "Cocok untuk kurikulum apa?", a: "Materi game disusun mengacu pada Capaian Pembelajaran (CP) Kurikulum Merdeka, sehingga relevan untuk pembelajaran di sekolah Indonesia." }
            ].map((faq, i) => (
              <details key={i} className="group bg-card border rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold list-none flex justify-between items-center">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-2 text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
