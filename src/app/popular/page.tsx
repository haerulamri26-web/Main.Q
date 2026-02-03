'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, Eye, User, Flame } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query } from 'firebase/firestore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays, isAfter } from 'date-fns';
import { useSound } from '@/hooks/use-sound';

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

export default function PopularPage() {
  const firestore = useFirestore();
  const { playStart } = useSound();
  const [popularTab, setPopularTab] = useState('all');

  // We query without ordering by date here, as we will sort client-side
  const gamesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publishedGames'));
  }, [firestore]);

  const { data: games, isLoading, error } = useCollection<Game>(gamesQuery);

  const popularGames = useMemo(() => {
    if (!games) return [];

    const now = new Date();
    let sourceGames;

    if (popularTab === 'weekly') {
        const sevenDaysAgo = subDays(now, 7);
        sourceGames = games.filter(game => 
            game.uploadDate?.toDate && isAfter(game.uploadDate.toDate(), sevenDaysAgo)
        );
    } else if (popularTab === 'monthly') {
        const thirtyDaysAgo = subDays(now, 30);
        sourceGames = games.filter(game => 
            game.uploadDate?.toDate && isAfter(game.uploadDate.toDate(), thirtyDaysAgo)
        );
    } else {
        sourceGames = games;
    }

    return [...sourceGames]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10); // Show top 10 popular games
  }, [games, popularTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2 font-headline">
                <Flame className="text-primary" />
                Game Paling Populer
            </h1>
            <Tabs value={popularTab} onValueChange={setPopularTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                    <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                    <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <p className="text-muted-foreground mb-8">
            Daftar game yang paling banyak dimainkan berdasarkan periode waktu yang dipilih.
        </p>
        
        {isLoading && (
          <div className="flex justify-center items-center h-64 rounded-lg bg-card border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && <p className="text-destructive text-center">Gagal memuat game populer: {error.message}</p>}

        {!isLoading && popularGames.length === 0 && (
            <div className="text-center text-muted-foreground py-16 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold">Tidak Ada Game Populer</h3>
                <p>Tidak ada game yang cocok dengan periode waktu ini. Coba filter lain.</p>
            </div>
        )}
        
        {!isLoading && popularGames.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularGames.map((game) => (
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
        )}
      </section>
    </div>
  );
}
