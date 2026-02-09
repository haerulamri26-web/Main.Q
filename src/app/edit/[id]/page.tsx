'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePenLine, AlertTriangle } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Re-using the same schema as the upload page
const editSchema = z.object({
  title: z.string().min(3, 'Judul minimal harus 3 karakter.'),
  description: z.string().optional(),
  class: z.string({
    required_error: 'Silakan pilih kelas.',
  }),
  subject: z.string({
    required_error: 'Silakan pilih mata pelajaran.',
  }),
  htmlCode: z.string().min(1, 'Kode HTML tidak boleh kosong.'),
});

type EditFormValues = z.infer<typeof editSchema>;

interface Game {
    id: string;
    userId: string;
    title: string;
    description: string;
    htmlCode: string;
    class: string;
    subject: string;
}

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !gameId) return null;
    return doc(firestore, 'publishedGames', gameId);
  }, [firestore, gameId]);

  const { data: game, isLoading: isGameLoading, error: gameError } = useDoc<Game>(gameDocRef);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      htmlCode: "",
    },
  });

  useEffect(() => {
    if (game) {
      // Once the game data is loaded, reset the form with its values.
      form.reset({
        title: game.title,
        description: game.description,
        class: game.class,
        subject: game.subject,
        htmlCode: game.htmlCode,
      });
    }
  }, [game, form]);

  const onSubmit = async (data: EditFormValues) => {
    if (!firestore || !user || !game) {
      toast({
        variant: 'destructive',
        title: 'Kesalahan',
        description: 'Tidak dapat memperbarui game. Pastikan Anda sudah masuk.',
      });
      return;
    }

    if (user.uid !== game.userId) {
        toast({
            variant: 'destructive',
            title: 'Tidak Diizinkan',
            description: 'Anda tidak memiliki izin untuk mengedit game ini.',
        });
        return;
    }

    setIsUpdating(true);
    
    try {
      const gameRef = doc(firestore, 'publishedGames', gameId);
      await updateDoc(gameRef, data);

      toast({
        title: 'Berhasil!',
        description: `Game Anda "${data.title}" telah diperbarui.`,
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Pembaruan Gagal',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUserLoading || isGameLoading) {
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
        <p className="text-muted-foreground">Anda harus masuk untuk mengedit game.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    );
  }

  if (gameError) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold text-destructive font-headline">Kesalahan Memuat Game</h1>
              <p className="text-muted-foreground">{gameError.message}</p>
          </div>
      );
  }

  if (!game) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold font-headline">Game Tidak Ditemukan</h1>
              <p className="text-muted-foreground">Game yang Anda coba edit tidak ada.</p>
          </div>
      );
  }

  if (user.uid !== game.userId) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="mt-4 text-2xl font-bold font-headline">Akses Ditolak</h1>
              <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengedit game ini.</p>
              <Button asChild className="mt-6">
                <Link href="/profile">Kembali ke Profil</Link>
              </Button>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FilePenLine className="h-6 w-6" />
            Edit Game
          </CardTitle>
          <CardDescription>
            Perbarui detail game Anda. Perubahan akan langsung terlihat setelah disimpan.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Game</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Game Memori Keren" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TK/PAUD">TK/PAUD</SelectItem>
                          <SelectItem value="Kelas 1 SD">Kelas 1 SD</SelectItem>
                          <SelectItem value="Kelas 2 SD">Kelas 2 SD</SelectItem>
                          <SelectItem value="Kelas 3 SD">Kelas 3 SD</SelectItem>
                          <SelectItem value="Kelas 4 SD">Kelas 4 SD</SelectItem>
                          <SelectItem value="Kelas 5 SD">Kelas 5 SD</SelectItem>
                          <SelectItem value="Kelas 6 SD">Kelas 6 SD</SelectItem>
                          <SelectItem value="Kelas 7 SMP">Kelas 7 SMP</SelectItem>
                          <SelectItem value="Kelas 8 SMP">Kelas 8 SMP</SelectItem>
                          <SelectItem value="Kelas 9 SMP">Kelas 9 SMP</SelectItem>
                          <SelectItem value="Kelas 10 SMA">Kelas 10 SMA</SelectItem>
                          <SelectItem value="Kelas 11 SMA">Kelas 11 SMA</SelectItem>
                          <SelectItem value="Kelas 12 SMA">Kelas 12 SMA</SelectItem>
                          <SelectItem value="Umum">Umum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Pelajaran</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendidikan Agama">Pendidikan Agama</SelectItem>
                          <SelectItem value="PPKn">PPKn</SelectItem>
                          <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
                          <SelectItem value="Bahasa Inggris">Bahasa Inggris</SelectItem>
                          <SelectItem value="Bahasa Daerah">Bahasa Daerah</SelectItem>
                          <SelectItem value="Bahasa Asing Lainnya">Bahasa Asing Lainnya</SelectItem>
                          <SelectItem value="Matematika">Matematika</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</SelectItem>
                          <SelectItem value="Fisika">Fisika</SelectItem>
                          <SelectItem value="Kimia">Kimia</SelectItem>
                          <SelectItem value="Biologi">Biologi</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Sosial (IPS)">Ilmu Pengetahuan Sosial (IPS)</SelectItem>
                          <SelectItem value="Sejarah">Sejarah</SelectItem>
                          <SelectItem value="Geografi">Geografi</SelectItem>
                          <SelectItem value="Ekonomi">Ekonomi</SelectItem>
                          <SelectItem value="Sosiologi">Sosiologi</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Alam dan Sosial (IPAS)">Ilmu Pengetahuan Alam dan Sosial (IPAS)</SelectItem>
                          <SelectItem value="Seni Budaya">Seni Budaya</SelectItem>
                          <SelectItem value="PJOK (Pendidikan Jasmani)">PJOK (Pendidikan Jasmani)</SelectItem>
                          <SelectItem value="Prakarya & Kewirausahaan">Prakarya & Kewirausahaan</SelectItem>
                          <SelectItem value="Informatika (TIK)">Informatika (TIK)</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan secara singkat game Anda."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="htmlCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode HTML</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="<!DOCTYPE html>..."
                        className="font-mono min-h-[250px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
