'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, Eye, User, GraduationCap, UploadCloud, Gamepad2, School, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination logic
  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel, selectedSubject]);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8 md:py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline leading-tight">
            Belajar Lebih Seru
            <br />
            dengan <span className="text-primary">Game Edukasi Interaktif</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
            Mainkan simulasi TKA, kuis, dan game pembelajaran untuk SD, SMP, dan SMA. Cocok untuk latihan siswa dan media ajar guru.
          </p>
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
            500+ game edukasi · Gratis · Tanpa install
          </p>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src="https://picsum.photos/seed/classroom-illustration/600/500"
            width={600}
            height={500}
            alt="Guru mengajar murid menggunakan tablet"
            className="rounded-lg shadow-xl"
            data-ai-hint="teacher students"
            priority
          />
        </div>
      </section>

      {/* Game Gallery Section */}
      <section id="semua-game" className="scroll-mt-20 mt-8 md:mt-16">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Jelajahi Game Edukasi</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
          <Button onClick={() => handleLevelChange('all')} variant={selectedLevel === 'all' ? 'default' : 'outline'} size="lg">
              Semua
          </Button>
          <Button onClick={() => handleLevelChange('SD')} variant={selectedLevel === 'SD' ? 'default' : 'outline'} size="lg">
              Kelas SD
          </Button>
          <Button onClick={() => handleLevelChange('SMP')} variant={selectedLevel === 'SMP' ? 'default' : 'outline'} size="lg">
              <GraduationCap className="mr-2 h-4 w-4" /> Kelas SMP
          </Button>
          <Button onClick={() => handleLevelChange('SMA')} variant={selectedLevel === 'SMA' ? 'default' : 'outline'} size="lg">
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

        <div className="animate-in fade-in-0 slide-in-from-top-12 duration-500 delay-200">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive text-center">Gagal memuat game: {error.message}</p>}
          
          {!isLoading && filteredGames.length === 0 && (
            <div className="text-center text-muted-foreground py-16 bg-card border rounded-lg">
              <h3 className="text-xl font-semibold">Tidak ada game yang cocok!</h3>
              <p>Coba filter yang berbeda.</p>
            </div>
          )}

          {paginatedGames && paginatedGames.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedGames.map((game) => (
                  <Card key={game.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
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

              {/* Pagination Controls */}
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
          )}
        </div>
      </section>

      {/* Why MAIN Q Section */}
      <section className="mt-16 md:mt-24 mb-16">
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
    </div>
  );
}