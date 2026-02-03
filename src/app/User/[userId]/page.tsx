'use client';

import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Loader2, Gamepad2, Eye, User, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { useSound } from '@/hooks/use-sound';

interface Game {
  id: string;
  title: string;
  description: string;
  htmlCode: string;
  uploadDate: any;
  class: string;
  subject: string;
  views: number;
  authorName: string;
  userId: string;
}

interface UserProfile {
  bio?: string;
  displayName?: string;
  photoURL?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();
  const { playStart } = useSound();
  const [currentPage, setCurrentPage] = useState(1);
  const GAMES_PER_PAGE = 20;

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const userGamesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'publishedGames'),
      where('userId', '==', userId)
    );
  }, [firestore, userId]);

  const { data: games, isLoading: isGamesLoading } = useCollection<Game>(userGamesQuery);
  
  const sortedGames = useMemo(() => {
    if (!games) return [];
    return [...games].sort((a, b) => {
      const dateA = a.uploadDate?.toDate ? a.uploadDate.toDate() : new Date(0);
      const dateB = b.uploadDate?.toDate ? b.uploadDate.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [games]);

  const totalPages = useMemo(() => {
    if (!sortedGames) return 0;
    return Math.ceil(sortedGames.length / GAMES_PER_PAGE);
  }, [sortedGames]);

  const paginatedGames = useMemo(() => {
    if (!sortedGames) return [];
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return sortedGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [sortedGames, currentPage]);

  if (isProfileLoading || isGamesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Pengguna tidak ditemukan</h1>
        <p className="text-muted-foreground">Profil publik untuk pengguna ini tidak dapat ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <Avatar className="h-24 w-24 text-3xl">
          <AvatarImage src={userProfile.photoURL || ''} alt={userProfile.displayName || ''} />
          <AvatarFallback>
            {(userProfile.displayName?.charAt(0) || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold font-headline">{userProfile.displayName || 'Pengguna'}</h1>
          <p className="mt-2 text-muted-foreground max-w-prose">
            {userProfile.bio || 'Pengguna ini belum menambahkan bio.'}
          </p>
        </div>
      </div>

      <section className="animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Gamepad2 />
                    Game oleh {userProfile.displayName || 'Pengguna'}
                </CardTitle>
                <CardDescription>
                    Lihat semua game yang telah diunggah oleh pengguna ini.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedGames && sortedGames.length > 0 ? (
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
                          <Link href={`/game/${game.id}`} className="absolute inset-0" aria-label={`Mainkan game ${game.title}`} />
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
                              {game.description || 'Tidak ada deskripsi.'}
                          </CardDescription>
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
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  <h3 className="text-xl font-semibold">Pengguna ini belum mengunggah game.</h3>
                </div>
              )}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
