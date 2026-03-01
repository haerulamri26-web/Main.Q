
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth, useDoc } from '@/firebase';
import { collection, query, where, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Loader2, Gamepad2, Eye, Trash2, AlertTriangle, FilePenLine, Pen, FlaskConical, FileText, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { sendEmailVerification, updateProfile } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface Lab {
  id: string;
  title: string;
  description: string;
  subject: string;
  views: number;
  htmlCode: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
  createdAt: any;
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
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string, type: 'game' | 'lab' | 'article' } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const userGamesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'publishedGames'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const userLabsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'publishedLabs'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const userArticlesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'articles'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: games, isLoading: isGamesLoading } = useCollection<Game>(userGamesQuery);
  const { data: labs, isLoading: isLabsLoading } = useCollection<Lab>(userLabsQuery);
  const { data: articles, isLoading: isArticlesLoading } = useCollection<Article>(userArticlesQuery);

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
          if (user.displayName !== data.displayName) {
              await updateProfile(user, { displayName: data.displayName });
          }
          const userDocRef = doc(firestore, 'users', user.uid);
          await setDoc(userDocRef, {
              displayName: data.displayName,
              bio: data.bio,
              photoURL: user.photoURL
          }, { merge: true });

          const batch = writeBatch(firestore);
          if (games) games.forEach(g => batch.update(doc(firestore, 'publishedGames', g.id), { authorName: data.displayName }));
          if (labs) labs.forEach(l => batch.update(doc(firestore, 'publishedLabs', l.id), { authorName: data.displayName }));
          if (articles) articles.forEach(a => batch.update(doc(firestore, 'articles', a.id), { authorName: data.displayName }));
          await batch.commit();

          toast({ title: "Profil Diperbarui" });
          setIsEditDialogOpen(false);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Gagal', description: error.message });
      } finally {
          setIsUpdatingProfile(false);
      }
  };

  const handleDeleteItem = async () => {
    if (!firestore || !itemToDelete) return;
    try {
        const collectionMap = { game: 'publishedGames', lab: 'publishedLabs', article: 'articles' };
        await deleteDoc(doc(firestore, collectionMap[itemToDelete.type], itemToDelete.id));
        toast({ title: "Berhasil Dihapus", description: `"${itemToDelete.title}" telah dihapus.` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Gagal Menghapus", description: error.message });
    } finally {
        setItemToDelete(null);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Email Terkirim" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal", description: error.message });
    } finally {
      setIsResending(false);
    }
  };

  if (isUserLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!user) return <div className="container mx-auto px-4 py-8 text-center"><h1 className="text-2xl font-bold">Akses Ditolak</h1><Button asChild className="mt-4"><Link href="/login">Masuk</Link></Button></div>;

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {user && !user.emailVerified && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verifikasi Email Anda</AlertTitle>
          <AlertDescription>
            Email Anda belum diverifikasi. 
            <Button variant="link" className="p-0 h-auto ml-2 text-destructive font-semibold" onClick={handleResendVerification} disabled={isResending}>
              {isResending ? 'Mengirim ulang...' : 'Kirim ulang email'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <Avatar className="h-24 w-24 text-3xl border-2 border-primary/20">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
          <AvatarFallback>{(user.displayName?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4">
             <h1 className="text-3xl font-bold font-headline">{user.displayName || 'Pengguna'}</h1>
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" size="icon" className="rounded-full shadow-sm"><Pen className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Profil</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="displayName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Tampilan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="bio" render={({ field }) => (
                                <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <DialogClose asChild><Button variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit" disabled={isUpdatingProfile}>{isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
             </Dialog>
          </div>
          <div className="mt-2 text-muted-foreground max-w-prose">
             {isProfileLoading ? <Skeleton className="h-4 w-1/2" /> : userProfile?.bio || 'Tidak ada bio.'}
          </div>
        </div>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1">
          <TabsTrigger value="games" className="gap-2"><Gamepad2 className="h-4 w-4" /> Game</TabsTrigger>
          <TabsTrigger value="labs" className="gap-2"><FlaskConical className="h-4 w-4" /> Lab</TabsTrigger>
          <TabsTrigger value="articles" className="gap-2"><FileText className="h-4 w-4" /> Artikel</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="animate-in fade-in duration-300">
          <Card className="border-none shadow-none bg-transparent">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-bold font-headline">Game Edukasi Saya</h2><p className="text-sm text-muted-foreground">Kelola game yang telah Anda publikasikan.</p></div>
              <Button asChild size="sm" className="rounded-full shadow-md"><Link href="/upload"><Plus className="mr-2 h-4 w-4" /> Unggah Game</Link></Button>
            </div>
            {isGamesLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : games && games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                  <Card key={game.id} className="overflow-hidden group hover:shadow-lg transition-all border">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <iframe srcDoc={game.htmlCode} className="w-full h-full pointer-events-none scale-75 origin-top" scrolling="no" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      <Link href={`/game/${game.id}`} className="absolute inset-0" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">{game.title}</CardTitle>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline" className="font-normal">{game.subject}</Badge>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {game.views}</span>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full"><Link href={`/edit/${game.id}`}><FilePenLine className="h-4 w-4 mr-2" /> Edit</Link></Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => setItemToDelete({ id: game.id, title: game.title, type: 'game' })}><Trash2 className="h-4 w-4" /></Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-20 bg-card border rounded-2xl border-dashed text-muted-foreground"><Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-20" /><p>Belum ada game edukasi yang diunggah.</p></div>}
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="animate-in fade-in duration-300">
          <Card className="border-none shadow-none bg-transparent">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-bold font-headline">Lab Virtual Saya</h2><p className="text-sm text-muted-foreground">Kelola simulasi laboratorium interaktif Anda.</p></div>
              <Button asChild size="sm" variant="outline" className="rounded-full"><Link href="/lab/upload"><Plus className="mr-2 h-4 w-4" /> Unggah Lab</Link></Button>
            </div>
            {isLabsLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : labs && labs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.map(lab => (
                  <Card key={lab.id} className="overflow-hidden group hover:shadow-lg transition-all border">
                    <div className="aspect-video bg-slate-100 relative">
                      <iframe srcDoc={lab.htmlCode} className="w-full h-full pointer-events-none scale-75 origin-top" scrolling="no" />
                      <div className="absolute inset-0 bg-black/5" />
                      <Link href={`/lab/${lab.id}`} className="absolute inset-0" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">{lab.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit font-normal">{lab.subject}</Badge>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full"><Link href={`/edit/lab/${lab.id}`}><FilePenLine className="h-4 w-4 mr-2" /> Edit</Link></Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => setItemToDelete({ id: lab.id, title: lab.title, type: 'lab' })}><Trash2 className="h-4 w-4" /></Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-20 bg-card border rounded-2xl border-dashed text-muted-foreground"><FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-20" /><p>Belum ada lab virtual yang diunggah.</p></div>}
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="animate-in fade-in duration-300">
          <Card className="border-none shadow-none bg-transparent">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-bold font-headline">Artikel Komunitas</h2><p className="text-sm text-muted-foreground">Kelola tulisan, tutorial, dan ide kreatif Anda.</p></div>
              <Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary"><Link href="/community/new"><Plus className="mr-2 h-4 w-4" /> Tulis Artikel</Link></Button>
            </div>
            {isArticlesLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : articles && articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="flex items-center justify-between p-5 bg-card border rounded-2xl group hover:border-primary/50 transition-all shadow-sm">
                    <div className="min-w-0 flex-1">
                      <Link href={`/community/article/${article.id}`} className="font-bold hover:text-primary truncate block text-lg mb-1">{article.title}</Link>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">{article.category}</Badge>
                        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {article.views} tayangan</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-6">
                      <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary" title="Edit Artikel">
                        <Link href={`/edit/article/${article.id}`}><FilePenLine className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full" title="Hapus Artikel" onClick={() => setItemToDelete({ id: article.id, title: article.title, type: 'article' })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-20 bg-card border rounded-2xl border-dashed text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-20" /><p>Anda belum menulis artikel apa pun.</p></div>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">Hapus Konten?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Tindakan ini tidak dapat dibatalkan. Konten <strong>"{itemToDelete?.title}"</strong> akan dihapus secara permanen dari server.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90 rounded-full">Hapus Permanen</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
