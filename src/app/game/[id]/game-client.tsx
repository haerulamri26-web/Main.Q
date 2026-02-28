'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Eye, User, GraduationCap, UploadCloud, Gamepad2, School, Globe, ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Game {
  id: string; title: string; description: string; uploadDate: any;
  htmlCode: string; class: string; subject: string; views: number;
  authorName: string; userId: string;
}

const GAMES_PER_PAGE = 12;

export default function HomeClient() {
  const firestore = useFirestore();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const gamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publishedGames'), orderBy('uploadDate', 'desc'));
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
      return levelMatch && subjectMatch;
    });
  }, [games, selectedLevel, selectedSubject]);

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedLevel, selectedSubject]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section - Menggunakan H1 untuk SEO */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8 md:py-12">
        <div className="space-y-6 text-center md:text-left">
          <Badge variant="outline" className="px-4 py-1 border-primary text-primary animate-pulse">
            🚀 Platform Game Edukasi Terlengkap
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline leading-tight tracking-tight">
            Belajar Lebih Seru dengan <span className="text-primary">Game Interaktif</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
            Temukan ribuan simulasi, kuis, dan media pembelajaran untuk Kurikulum Merdeka (SD, SMP, SMA). Gratis dan bisa dimainkan langsung tanpa install!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
              <Link href="#semua-game"><Gamepad2 className="mr-2 h-5 w-5" /> Mulai Belajar</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/upload"><UploadCloud className="mr-2 h-5 w-5" /> Bagikan Karya Guru</Link>
            </Button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Image
            src="https://picsum.photos/seed/learning/600/400"
            width={600} height={400}
            alt="Anak-anak belajar interaktif"
            className="relative rounded-lg shadow-2xl border"
            priority
          />
        </div>
      </header>

      {/* Ad Slot 1 - Banner Atas */}
      <div className="w-full h-24 bg-muted/20 border-y my-12 flex items-center justify-center text-xs text-muted-foreground italic">
        Iklan Banner Atas (AdSense Placeholder)
      </div>

      {/* Filter Section */}
      <section id="semua-game" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold font-headline mb-2">Pustaka Media Interaktif</h2>
            <p className="text-muted-foreground text-sm">Pilih jenjang sekolah dan mata pelajaran untuk mulai menjelajah.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'SD', 'SMP', 'SMA'].map((lvl) => (
              <Button 
                key={lvl}
                onClick={() => setSelectedLevel(lvl)} 
                variant={selectedLevel === lvl ? 'default' : 'outline'} 
                size="sm"
                className="rounded-full"
              >
                {lvl === 'all' ? 'Semua Kelas' : `Kelas ${lvl}`}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[280px] bg-card">
              <SelectValue placeholder="Pilih Mata Pelajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
              {uniqueSubjects.map((sub, idx) => (
                <SelectItem key={idx} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-px flex-1 bg-border hidden sm:block"></div>
        </div>

        {/* Game Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : paginatedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedGames.map((game) => (
                <Card key={game.id} className="group border-none shadow-none bg-transparent overflow-hidden">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border mb-4">
                    <iframe
                      srcDoc={game.htmlCode}
                      className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                      sandbox="allow-scripts allow-same-origin"
                      scrolling="no"
                      loading="lazy"
                    />
                    <Link href={`/game/${game.id}`} className="absolute inset-0 z-10" aria-label={`Mainkan ${game.title}`} />
                    <Badge className="absolute top-3 left-3 bg-white/90 text-black backdrop-blur hover:bg-white">{game.class}</Badge>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <Button size="sm" className="w-full rounded-full">Mainkan Sekarang</Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{game.subject}</p>
                    <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">{game.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {game.authorName}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {game.views}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground">Yah, belum ada game untuk kategori ini. <Link href="/upload" className="text-primary underline">Jadi yang pertama mengunggah?</Link></p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-16 flex justify-center items-center gap-6">
            <Button variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Prev
            </Button>
            <span className="text-sm font-bold">Halaman {currentPage} / {totalPages}</span>
            <Button variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        )}
      </section>

      {/* Ad Slot 2 - Native Style */}
      <div className="my-20 p-8 border rounded-3xl bg-primary/5 flex flex-col items-center text-center">
         <span className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest">Sponsor</span>
         <div className="text-muted-foreground italic">Tempat Iklan In-Feed AdSense</div>
      </div>

      {/* Feature Section with Article Tags */}
      <section className="grid md:grid-cols-3 gap-10 py-16">
        <article className="space-y-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600"><School /></div>
          <h3 className="text-xl font-bold">Inovasi Guru Indonesia</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Kami percaya setiap guru adalah kreator. Platform ini memberikan ruang bagi pendidik untuk berbagi media ajar berbasis web yang interaktif.</p>
        </article>
        <article className="space-y-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600"><Star /></div>
          <h3 className="text-xl font-bold">Game-Based Learning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Ubah rasa bosan menjadi antusiasme. Dengan elemen gamifikasi, materi sesulit apapun akan lebih mudah diserap oleh siswa di sekolah.</p>
        </article>
        <article className="space-y-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600"><Globe /></div>
          <h3 className="text-xl font-bold">Akses Tanpa Batas</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Bisa diakses dari Chrome, Safari, atau browser HP manapun. Tanpa perlu download APK, sehingga menghemat memori perangkat siswa.</p>
        </article>
      </section>

      {/* SEO Footer Content - Sangat Penting untuk AdSense */}
      <footer className="mt-20 pt-10 border-t">
        <div className="bg-card p-8 rounded-3xl border shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-primary" /> Mengapa Memilih MAIN Q untuk Pendidikan?</h2>
          <div className="columns-1 md:columns-2 gap-10 text-sm text-muted-foreground leading-relaxed">
            <p className="mb-4">
              <strong>MAIN Q</strong> adalah platform revolusioner yang menjembatani antara hiburan dan pendidikan. Di era digital ini, <strong>media pembelajaran interaktif</strong> bukan lagi sekadar pilihan, melainkan kebutuhan. Kami menyediakan akses ke ratusan simulasi belajar yang mencakup kurikulum nasional.
            </p>
            <p className="mb-4">
              Setiap game di platform kami telah melalui moderasi untuk memastikan konten aman bagi anak. Guru dapat menggunakan link game sebagai tugas rumah (PR) atau kuis di dalam kelas. Statistik <em>views</em> membantu guru melihat seberapa populer media ajar yang mereka buat di kalangan komunitas pendidikan Indonesia.
            </p>
            <p>
              Kami mendukung penuh keberhasilan <strong>Kurikulum Merdeka</strong> dengan menyediakan tool yang fleksibel. Mulai dari materi literasi, numerasi, hingga karakter budi pekerti, semuanya dikemas dalam bentuk permainan yang menantang namun tetap edukatif. Bergabunglah dengan ribuan guru lainnya di MAIN Q!
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
