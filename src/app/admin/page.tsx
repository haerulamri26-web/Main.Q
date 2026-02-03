'use client';

import { useState, useMemo } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, Shield, Trash2, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Game {
  id: string;
  title: string;
  authorName: string;
  userId: string;
  uploadDate: any;
  views: number;
}

const GAMES_PER_PAGE = 20;

export default function AdminPage() {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const allGamesQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null; // Only fetch if user is an admin
    return query(collection(firestore, 'publishedGames'), orderBy('uploadDate', 'desc'));
  }, [firestore, isAdmin]);

  const { data: games, isLoading: isGamesLoading } = useCollection<Game>(allGamesQuery);

  const totalPages = useMemo(() => {
    if (!games) return 0;
    return Math.ceil(games.length / GAMES_PER_PAGE);
  }, [games]);

  const paginatedGames = useMemo(() => {
    if (!games) return [];
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return games.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [games, currentPage]);

  const handleDeleteGame = async () => {
    if (!firestore || !gameToDelete) return;
    try {
        const gameRef = doc(firestore, 'publishedGames', gameToDelete.id);
        await deleteDoc(gameRef);
        toast({
            title: "Game Dihapus",
            description: `"${gameToDelete.title}" telah berhasil dihapus.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Menghapus Game",
            description: error.message || "Terjadi kesalahan yang tidak diketahui.",
        });
    } finally {
        setGameToDelete(null);
    }
  };

  if (isAdminLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Memverifikasi akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold font-headline">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Button asChild className="mt-6">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Shield />
                    Panel Admin - Manajemen Game
                </CardTitle>
                <CardDescription>
                    Kelola semua game yang diunggah oleh pengguna. Anda dapat menghapus postingan yang bermasalah dari sini.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {isGamesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : games && games.length > 0 ? (
                <>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul Game</TableHead>
                                <TableHead>Penulis</TableHead>
                                <TableHead>Tanggal Unggah</TableHead>
                                <TableHead>Dilihat</TableHead>
                                <TableHead className="text-right">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedGames.map((game) => (
                                <TableRow key={game.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/game/${game.id}`} className="hover:underline flex items-center gap-1.5" target="_blank">
                                            {game.title}
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/user/${game.userId}`} className="hover:underline" target="_blank">
                                            {game.authorName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{game.uploadDate?.toDate ? format(game.uploadDate.toDate(), 'dd MMM yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{game.views}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="icon" onClick={() => setGameToDelete(game)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Hapus Game</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                  <h3 className="text-xl font-semibold">Belum ada game yang diunggah.</h3>
                  <p>Saat pengguna mengunggah game, game tersebut akan muncul di sini.</p>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
      <AlertDialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat diurungkan. Ini akan menghapus game "{gameToDelete?.title}" oleh {gameToDelete?.authorName} secara permanen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame} className="bg-destructive hover:bg-destructive/90">
                Ya, Hapus Game Ini
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
