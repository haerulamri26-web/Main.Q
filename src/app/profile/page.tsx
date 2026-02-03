'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth, useDoc } from '@/firebase';
import { collection, query, where, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Loader2, Gamepad2, Eye, FilePlus, Trash2, AlertTriangle, Play, FilePenLine, Pen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { sendEmailVerification, updateProfile } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
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
}

interface UserProfile {
  bio?: string;
  displayName?: string;
  photoURL?: string;
}

const profileSchema = z.object({
    displayName: z.string().min(3, "Nama tampilan minimal 3 karakter.").max(50, "Nama tampilan maksimal 50 karakter."),
    bio: z.string().max(160, "Bio maksimal 160 karakter.").optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { playStart } = useSound();
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const GAMES_PER_PAGE = 20;

  const userGamesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'publishedGames'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: games, isLoading: isGamesLoading } = useCollection<Game>(userGamesQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: '',
        bio: '',
    },
  });

    useEffect(() => {
      // Auto-create profile in Firestore if it doesn't exist for the logged-in user
      if (user && firestore && !isProfileLoading && !userProfile) {
        const userDocRef = doc(firestore, 'users', user.uid);
        // Use setDoc with merge:true to be safe, though it shouldn't exist.
        setDoc(userDocRef, {
          displayName: user.displayName || user.email, // Fallback to email for name
          photoURL: user.photoURL || null,
          bio: ''
        }, { merge: true }).catch(error => {
          // We don't want to bother the user with a toast for this background task.
          console.error("Gagal membuat profil pengguna secara otomatis:", error);
        });
      }
    }, [user, firestore, isProfileLoading, userProfile]);

  useEffect(() => {
      if (user && isEditDialogOpen) {
          form.setValue('displayName', user.displayName || '');
      }
      if (userProfile && isEditDialogOpen) {
          form.setValue('bio', userProfile.bio || '');
      }
  }, [user, userProfile, form, isEditDialogOpen]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
      if (!user || !auth || !firestore) return;

      setIsUpdatingProfile(true);

      try {
          // Only update auth profile if the name has changed
          if (user.displayName !== data.displayName) {
              await updateProfile(user, { displayName: data.displayName });
          }

          // Update Firestore profile document
          const userDocRef = doc(firestore, 'users', user.uid);
          await setDoc(userDocRef, {
              displayName: data.displayName,
              bio: data.bio,
              photoURL: user.photoURL
          }, { merge: true });

          // Update authorName in all existing games if the name changed
          const hasNameChanged = user.displayName !== data.displayName;
          if (hasNameChanged && games && games.length > 0) {
              const batch = writeBatch(firestore);
              games.forEach(game => {
                  const gameRef = doc(firestore, 'publishedGames', game.id);
                  batch.update(gameRef, { authorName: data.displayName });
              });
              await batch.commit();
          }

          toast({
              title: "Profil Diperbarui",
              description: "Informasi profil Anda telah berhasil disimpan.",
          });
          setIsEditDialogOpen(false);
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Gagal Memperbarui Profil',
              description: error.message || 'Terjadi kesalahan.',
          });
      } finally {
          setIsUpdatingProfile(false);
      }
  };


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

  const handleResendVerification = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Email Terkirim",
        description: "Email verifikasi baru telah dikirimkan ke alamat Anda.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Mengirim Ulang",
        description: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsResending(false);
    }
  };


  if (isUserLoading || (user && (isGamesLoading || isProfileLoading) && !sortedGames)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda harus masuk untuk melihat halaman profil.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {user && !user.emailVerified && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verifikasi Email Anda</AlertTitle>
          <AlertDescription>
            Email Anda belum diverifikasi. Silakan periksa kotak masuk Anda untuk tautan verifikasi.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-destructive font-semibold"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? 'Mengirim ulang...' : 'Kirim ulang email'}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <Avatar className="h-24 w-24 text-3xl">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
          <AvatarFallback>
            {(user.displayName?.charAt(0) || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4">
             <h1 className="text-3xl font-bold font-headline">{user.displayName || 'Pengguna'}</h1>
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Pen className="h-4 w-4" />
                        <span className="sr-only">Edit Profil</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profil</DialogTitle>
                        <DialogDescription>
                            Buat perubahan pada profil Anda di sini. Klik simpan setelah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Tampilan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nama Anda" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Ceritakan sedikit tentang diri Anda." {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Batal</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isUpdatingProfile}>
                                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
             </Dialog>
          </div>
          <div className="mt-2 text-muted-foreground max-w-prose">
             {isProfileLoading ? <Skeleton className="h-4 w-1/2" /> : userProfile?.bio || 'Tidak ada bio. Klik edit untuk menambahkan.'}
          </div>
        </div>
      </div>

      <section className="animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2 font-headline">
                    <div className="flex items-center gap-2">
                        <Gamepad2 />
                        Game Saya
                    </div>
                    <Button asChild>
                        <Link href="/upload">
                            <FilePlus className="mr-2 h-4 w-4" />
                            Unggah Game Baru
                        </Link>
                    </Button>
                </CardTitle>
                <CardDescription>
                    Kelola semua game yang telah Anda unggah. Anda dapat melihat, mengedit, dan menghapus game dari sini.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {isGamesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedGames && sortedGames.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedGames.map((game) => (
                    <Card key={game.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="relative aspect-video overflow-hidden border-b bg-gray-800 group">
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
                        <div className="grid w-full grid-cols-3 gap-2">
                            <Button asChild size="sm" onClick={playStart} noSound>
                                <Link href={`/game/${game.id}`}>
                                    <Play />
                                    Mainkan
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/edit/${game.id}`}>
                                    <FilePenLine />
                                    Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setGameToDelete(game)}>
                                <Trash2 />
                                Hapus
                            </Button>
                        </div>
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
                  <h3 className="text-xl font-semibold">Anda belum mengunggah game.</h3>
                  <p>Klik "Unggah Game Baru" untuk memulai.</p>
                </div>
              )}
            </CardContent>
        </Card>
        
      </section>
    </div>

    <AlertDialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
                Tindakan ini tidak dapat diurungkan. Ini akan menghapus game "{gameToDelete?.title}" secara permanen
                dari server.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame} className="bg-destructive hover:bg-destructive/90">
                Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
