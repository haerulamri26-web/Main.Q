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
import { Loader2, UploadCloud, HelpCircle, AlertCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

/** Helper to convert title to a URL-friendly slug */
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};

export default function UploadGamePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      htmlCode: '',
    },
  });

  const onSubmit = (data: UploadFormValues) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Kesalahan',
        description: 'Tidak dapat mengunggah game. Pastikan Anda sudah masuk.',
      });
      return;
    }
    
    setIsUploading(true);

    const slug = slugify(data.title);
    const shortId = Math.random().toString(36).substring(2, 7);
    const customId = `${slug}-${shortId}`;

    const gameData = {
      ...data,
      userId: user.uid,
      authorName: user.displayName || 'Pengguna Anonim',
      uploadDate: serverTimestamp(),
      views: 0,
    };
    
    const gameRef = doc(firestore, 'publishedGames', customId);

    setDocumentNonBlocking(gameRef, gameData)
      .then(() => {
        toast({
          title: 'Berhasil!',
          description: `Game Anda "${data.title}" telah diunggah.`,
        });
        router.push('/profile');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Unggah Gagal',
          description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
        });
        setIsUploading(false);
      });
  };
  
    if (isUserLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        router.replace('/login?redirect=/upload');
        return (
             <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Anda harus masuk untuk mengunggah. Mengalihkan ke halaman login...</p>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <HelpCircle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          <AlertTitle className="font-headline text-amber-800 dark:text-amber-400">Gagal Unggah Game dari Canva atau AI?</AlertTitle>
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
            Gunakan prompt perbaikan di <Link href="/help" className="font-bold underline text-amber-700 dark:text-amber-400">Pusat Bantuan</Link> agar game Anda tampil dengan sempurna.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <UploadCloud className="h-6 w-6" />
              Unggah Game Anda
            </CardTitle>
            <CardDescription>
              Isi detail di bawah ini dan tempel kode HTML Anda. URL game akan dibuat otomatis berdasarkan judul.
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                   <AlertCircle className="h-4 w-4 text-primary" />
                   <span>Butuh bantuan coding? Cek prompt di <Link href="/help" className="text-primary hover:underline font-medium">Pusat Bantuan</Link></span>
                </div>
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
    </div>
  );
}
