
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
import { Loader2, FlaskConical, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const editSchema = z.object({
  title: z.string().min(3, 'Judul minimal harus 3 karakter.'),
  description: z.string().optional(),
  subject: z.string({
    required_error: 'Silakan pilih mata pelajaran.',
  }),
  htmlCode: z.string().min(1, 'Kode HTML tidak boleh kosong.'),
});

type EditFormValues = z.infer<typeof editSchema>;

interface Lab {
    id: string;
    userId: string;
    title: string;
    description: string;
    htmlCode: string;
    subject: string;
}

export default function EditLabPage() {
  const params = useParams();
  const labId = params.id as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const labDocRef = useMemoFirebase(() => {
    if (!firestore || !labId) return null;
    return doc(firestore, 'publishedLabs', labId);
  }, [firestore, labId]);

  const { data: lab, isLoading: isLabLoading } = useDoc<Lab>(labDocRef);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      htmlCode: "",
    },
  });

  useEffect(() => {
    if (lab) {
      form.reset({
        title: lab.title,
        description: lab.description,
        subject: lab.subject,
        htmlCode: lab.htmlCode,
      });
    }
  }, [lab, form]);

  const onSubmit = async (data: EditFormValues) => {
    if (!firestore || !user || !lab) return;
    if (user.uid !== lab.userId) {
        toast({ variant: 'destructive', title: 'Akses Ditolak' });
        return;
    }

    setIsUpdating(true);
    try {
      await updateDoc(doc(firestore, 'publishedLabs', labId), data);
      toast({ title: 'Simulasi Diperbarui!', description: 'Perubahan Anda telah disimpan secara permanen.' });
      router.push('/profile');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUserLoading || isLabLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;
  
  if (!user || (lab && user.uid !== lab.userId)) {
    return (
      <div className="container text-center py-20">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold font-headline mb-4">Akses Tidak Diizinkan</h1>
        <Button asChild><Link href="/profile">Kembali ke Profil</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/profile"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline">Edit Simulasi Lab</h1>
            <p className="text-muted-foreground">Perbarui detail dan kode simulasi Anda.</p>
          </div>
        </div>

        <Card className="shadow-lg border-2">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-primary">
              <FlaskConical className="h-6 w-6" />
              Detail Simulasi
            </CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-6 pt-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Judul Simulasi</FormLabel>
                    <FormControl><Input placeholder="Contoh: Praktikum Hukum Archimedes" {...field} className="h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Mata Pelajaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Pilih mata pelajaran" /></SelectTrigger></FormControl>
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
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Deskripsi & Tujuan</FormLabel>
                    <FormControl><Textarea placeholder="Jelaskan cara penggunaan dan konsep yang dipelajari..." className="min-h-[120px] resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="htmlCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Kode HTML Simulasi</FormLabel>
                    <FormControl>
                      <div className="relative font-mono text-sm">
                        <Textarea 
                          placeholder="<!DOCTYPE html>..." 
                          className="min-h-[400px] bg-slate-950 text-slate-100 border-none rounded-xl p-6 focus-visible:ring-primary" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
              <CardFooter className="border-t bg-muted/30 flex gap-4 pt-6">
                <Button asChild variant="outline" className="flex-1 rounded-full h-11"><Link href="/profile">Batal</Link></Button>
                <Button type="submit" className="flex-[2] rounded-full h-11 shadow-md" disabled={isUpdating}>
                  {isUpdating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Menyimpan...</> : 'Simpan Perubahan'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
