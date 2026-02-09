'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const uploadSchema = z.object({
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

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
    }
  });

  const onSubmit = async (data: UploadFormValues) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Kesalahan',
        description: 'Anda harus masuk untuk mengunggah game.',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      if (!firestore) throw new Error("Firestore is not initialized");
      const gamesCollection = collection(firestore, 'publishedGames');
      const newGame = {
        ...data,
        userId: user.uid,
        authorName: user.displayName || user.email || 'Pengguna Anonim',
        uploadDate: serverTimestamp(),
        views: 0,
      };
      
      await addDocumentNonBlocking(gamesCollection, newGame);

      toast({
        title: 'Berhasil!',
        description: `Game Anda "${data.title}" telah diunggah.`,
      });
      form.reset();
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unggahan Gagal',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda harus masuk untuk mengunggah game.</p>
        <Button asChild className="mt-4">
          <a href="/login">Masuk</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <UploadCloud className="h-6 w-6" />
            Unggah Game Baru
          </CardTitle>
          <CardDescription>
            Bagikan game HTML interaktif Anda dengan komunitas MAIN Q. Isi detailnya dan tempel kode Anda di bawah.
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : 'Unggah Game'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
