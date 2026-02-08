'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, Search, Eye, User, ChevronLeft, ChevronRight, FilePlus } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useSound } from '@/hooks/use-sound';


// Define the type for a game document
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
}

export default function Home() {
  const firestore = useFirestore();
  const { playStart } = useSound();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const GAMES_PER_PAGE = 10;

  const gamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publishedGames'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: games, isLoading, error } = useCollection<Game>(gamesQuery);

  const uniqueClasses = useMemo(() => {
    if (!games) return [];
    // Filter out empty values, then sort alphabetically, with "Umum" at the end
    const classes = [...new Set(games.map(game => game.class).filter(Boolean))].sort((a, b) => {
        if (a === 'Umum') return 1;
        if (b === 'Umum') return -1;
        return a.localeCompare(b, undefined, { numeric: true });
    });
    return classes;
  }, [games]);

  const uniqueSubjects = useMemo(() => {
    if (!games) return [];
    // Filter out empty values and sort
    return [...new Set(games.map(game => game.subject).filter(Boolean))].sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(game => {
      const searchMatch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const classMatch = selectedClass === 'all' || game.class === selectedClass;
      const subjectMatch = selectedSubject === 'all' || game.subject === selectedSubject;
      return searchMatch && classMatch && subjectMatch;
    });
  }, [games, searchTerm, selectedClass, selectedSubject]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSubject]);

  const totalPages = useMemo(() => {
    if (!filteredGames) return 0;
    return Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  }, [filteredGames]);

  const paginatedGames = useMemo(() => {
    if (!filteredGames) return [];
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">Platform #1 untuk Website Interaktif Edukasi</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Jelajahi ribuan materi atau buat website interaktif Anda sendiri secara gratis dengan bantuan AI. Platform oleh guru, untuk siswa.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link href="/tutorial">
                    <FilePlus className="mr-2 h-5 w-5" />
                    Cara Membuat (Gratis)
                </Link>
            </Button>
        </div>
      </section>

      <section className="mb-12 p-6 md:p-8 bg-card rounded-lg shadow-sm border animate-in fade-in-0 slide-in-from-top-6 duration-500 delay-50">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-4">Apa itu MAIN Q?</h2>
        <p className="text-muted-foreground text-center max-w-4xl mx-auto">
            MAIN Q adalah sebuah revolusi dalam dunia pendidikan di Indonesia. Kami menyediakan platform gratis di mana para guru dapat berkreasi dan berbagi materi pembelajaran dalam format website interaktif yang menarik. Misi kami adalah membuat proses belajar menjadi sebuah petualangan yang seru, bukan lagi beban. Dengan MAIN Q, guru dapat dengan mudah mengubah materi ajar menjadi game edukasi tanpa perlu keahlian coding, berkat bantuan teknologi AI.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
            <div className="p-4 bg-background rounded-md">
                <h3 className="font-bold text-lg text-primary">Untuk Para Guru</h3>
                <p className="text-muted-foreground mt-1 text-sm">Buat materi ajar yang "lengket" di benak siswa. Unggah game buatan Anda, lacak popularitasnya, dan jadilah bagian dari komunitas pendidik inovatif. Bagikan karya Anda dan lihat bagaimana siswa dari seluruh negeri memainkan game Anda.</p>
            </div>
            <div className="p-4 bg-background rounded-md">
                <h3 className="font-bold text-lg text-accent-foreground">Untuk Para Siswa</h3>
                <p className="text-muted-foreground mt-1 text-sm">Belajar jadi tidak membosankan lagi! Jelajahi ribuan game edukasi dari berbagai mata pelajaran, mulai dari Matematika hingga Sejarah. Tantang dirimu sendiri, mainkan game buatan gurumu, dan temukan cara baru untuk memahami pelajaran.</p>
            </div>
        </div>
      </section>

      <section className="mb-8 p-4 bg-card rounded-lg shadow-sm border animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari game..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter berdasarkan kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {uniqueClasses.map((cls, index) => (
                <SelectItem key={`${cls}-${index}`} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter berdasarkan mata pelajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
              {uniqueSubjects.map((sub, index) => (
                <SelectItem key={`${sub}-${index}`} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section id="semua-game" className="animate-in fade-in-0 slide-in-from-top-12 duration-500 delay-200 scroll-mt-20">
        <h2 className="text-2xl font-bold mb-6 font-headline">Jelajahi Game Edukasi</h2>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && <p className="text-destructive text-center">Gagal memuat game: {error.message}</p>}
        
        {!isLoading && games && games.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <h3 className="text-xl font-semibold">Belum ada game!</h3>
            <p>Jadilah yang pertama mengunggah game.</p>
          </div>
        )}
        
        {!isLoading && filteredGames && filteredGames.length === 0 && games && games.length > 0 && (
           <div className="text-center text-muted-foreground py-16">
            <h3 className="text-xl font-semibold">Tidak ada game yang cocok!</h3>
            <p>Coba kata kunci atau filter yang berbeda.</p>
          </div>
        )}

        {paginatedGames && paginatedGames.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGames.map((game) => (
                <Card key={game.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden border-b bg-gray-800">
                    <iframe
                      srcDoc={game.htmlCode}
                      title={`Pratinjau ${game.title}`}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
                      scrolling="no"
                    />
                    <Link
                      href={`/game/${game.id}`}
                      className="absolute inset-0"
                      aria-label={`Mainkan game ${game.title}`}
                    />
                  </div>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                      <Badge variant="secondary">{game.class}</Badge>
                      <Badge variant="secondary">{game.subject}</Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                        <Eye className="h-4 w-4" />
                        <span>{game.views || 0}</span>
                      </div>
                    </div>
                    <CardTitle className="truncate">{game.title}</CardTitle>
                    <CardDescription className="truncate h-5">
                      {game.description || 'Tidak ada deskripsi yang diberikan.'}
                    </CardDescription>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <Link href={`/user/${game.userId}`} className="truncate hover:underline">
                        Oleh {game.authorName}
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end">
                    <Button asChild className="w-full" onClick={playStart} noSound>
                      <Link href={`/game/${game.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Mainkan Sekarang
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
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
        )}
      </section>
    </div>
  );
}
