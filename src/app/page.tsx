'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, Search, Eye, User, ChevronLeft, ChevronRight, GraduationCap, School, Globe, UploadCloud } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';


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

const GAMES_PER_PAGE = 12;

export default function Home() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const gamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publishedGames'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: games, isLoading, error } = useCollection<Game>(gamesQuery);

  const uniqueClasses = useMemo(() => {
    if (!games) return [];
    return [...new Set(games.map(game => game.class).filter(Boolean))].sort();
  }, [games]);

  const uniqueSubjects = useMemo(() => {
    if (!games) return [];
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

  const totalPages = useMemo(() => {
    if (!filteredGames) return 0;
    return Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  }, [filteredGames]);

  const paginatedGames = useMemo(() => {
    if (!filteredGames) return [];
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSubject]);


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-24 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <Badge variant="outline" className="mb-4">Platform Game Edukasi HTML5</Badge>
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">Belajar Jadi Menyenangkan dengan MAIN Q</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Selamat datang di MAIN Q, platform #1 di Indonesia untuk menemukan dan berbagi game edukasi interaktif berbasis HTML. Kami memberdayakan guru untuk berkreasi dan membantu siswa belajar dengan cara yang lebih seru dan efektif.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
            <Button asChild size="lg">
                <Link href="#semua-game">
                    <Play className="mr-2 h-5 w-5" />
                    Jelajahi Game
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/upload">
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Unggah Karyamu
                </Link>
            </Button>
        </div>
      </section>

      {/* Why MAIN Q Section */}
      <section className="mb-16 md:mb-24">
        <h2 className="text-3xl font-bold font-headline text-center mb-12">Kenapa Memilih MAIN Q?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <School className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-headline mb-2">Untuk Para Guru</h3>
            <p className="text-muted-foreground">Bagikan materi ajar dalam format game interaktif dengan mudah. Ciptakan pengalaman belajar yang tak terlupakan bagi siswa Anda tanpa perlu keahlian coding yang rumit.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-accent/20 p-4 rounded-full mb-4">
              <GraduationCap className="h-10 w-10 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold font-headline mb-2">Untuk Para Siswa</h3>
            <p className="text-muted-foreground">Ubah cara belajarmu! Jelajahi ribuan game dari berbagai mata pelajaran, mulai dari Matematika hingga Sejarah, yang dibuat langsung oleh para guru hebat di seluruh Indonesia.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-green-500/10 p-4 rounded-full mb-4">
              <Globe className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold font-headline mb-2">Gratis dan Terbuka</h3>
            <p className="text-muted-foreground">MAIN Q adalah platform terbuka dan gratis untuk semua. Misi kami adalah mendemokratisasi pendidikan yang berkualitas dan menyenangkan bagi setiap guru dan siswa.</p>
          </div>
        </div>
      </section>

      {/* Game Gallery Section */}
      <section id="semua-game" className="scroll-mt-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Jelajahi Game Edukasi</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Gunakan filter di bawah untuk menemukan game yang paling sesuai dengan kelas dan mata pelajaran yang Anda cari.</p>
        </div>

        <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border sticky top-[77px] z-40 animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari judul game..."
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
        </div>

        <div className="animate-in fade-in-0 slide-in-from-top-12 duration-500 delay-200">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive text-center">Gagal memuat game: {error.message}</p>}
          
          {!isLoading && paginatedGames.length === 0 && (
            <div className="text-center text-muted-foreground py-16 bg-card border rounded-lg">
              <h3 className="text-xl font-semibold">Tidak ada game yang cocok!</h3>
              <p>Coba kata kunci atau filter yang berbeda, atau jelajahi semua game yang tersedia.</p>
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
                          sandbox="allow-scripts allow-same-origin"
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <Link href={`/user/${game.userId}`} className="truncate hover:underline">
                          Oleh {game.authorName}
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Button asChild className="w-full">
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
        </div>
      </section>
    </div>
  );
}
