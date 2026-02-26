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
import { Loader2, FlaskConical, HelpCircle, AlertCircle } from 'lucide-react';
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

export default function UploadLabPage() {
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
        description: 'Tidak dapat mengunggah simulasi. Pastikan Anda sudah masuk.',
      });
      return;
    }
    
    setIsUploading(true);

    const slug = slugify(data.title);
    const shortId = Math.random().toString(36).substring(2, 7);
    const customId = `${slug}-${shortId}`;

    const labData = {
      ...data,
      userId: user.uid,
      authorName: user.displayName || 'Pengguna Anonim',
      uploadDate: serverTimestamp(),
      views: 0,
    };
    
    const labRef = doc(firestore, 'publishedLabs', customId);

    setDocumentNonBlocking(labRef, labData)
      .then(() => {
        toast({
          title: 'Berhasil!',
          description: `Simulasi Anda "${data.title}" telah diunggah.`,
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
        router.replace('/login?redirect=/lab/upload');
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
          <AlertTitle className="font-headline text-amber-800 dark:text-amber-400">Masalah dengan Kode Lab?</AlertTitle>
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
            Lihat panduan perbaikan kode di <Link href="/help" className="font-bold underline text-amber-700 dark:text-amber-400">Pusat Bantuan</Link>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <FlaskConical className="h-6 w-6" />
              Unggah Simulasi Lab
            </CardTitle>
            <CardDescription>
              Bagikan simulasi interaktif Anda. URL simulasi akan dibuat berdasarkan judul yang Anda berikan.
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
                      <FormLabel>Judul Simulasi</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Simulasi Reaksi Kimia" {...field} />
                      </FormControl>
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
                          <SelectItem value="Fisika">Fisika</SelectItem>
                          <SelectItem value="Kimia">Kimia</SelectItem>
                          <SelectItem value="Biologi">Biologi</SelectItem>
                          <SelectItem value="Matematika">Matematika</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan secara singkat tentang simulasi Anda."
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
                   <span>Butuh panduan teknis? Cek <Link href="/help" className="text-primary hover:underline font-medium">Pusat Bantuan</Link></span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : 'Unggah Simulasi'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
