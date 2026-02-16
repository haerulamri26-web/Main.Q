'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, Eye, User, FlaskConical, UploadCloud } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';


// Define the type for a lab document
interface Lab {
  id: string;
  title: string;
  description: string;
  htmlCode: string;
  subject: string;
  views: number;
  authorName: string;
  userId: string;
}

export default function LabPage() {
  const firestore = useFirestore();

  const labsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publishedLabs'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: labs, isLoading, error } = useCollection<Lab>(labsQuery);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center gap-3">
            <FlaskConical className="h-10 w-10" />
            Lab Virtual & Simulasi
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
          Jelajahi, mainkan, dan bagikan simulasi interaktif untuk mata pelajaran sains seperti Fisika, Kimia, dan Biologi. Belajar menjadi lebih hidup di laboratorium virtual MAIN Q.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
                <Link href="/lab/upload">
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Unggah Simulasimu
                </Link>
            </Button>
        </div>
      </section>

      {/* Lab Gallery Section */}
      <section id="semua-lab" className="scroll-mt-20">
        <div className="animate-in fade-in-0 slide-in-from-top-12 duration-500 delay-200">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive text-center">Gagal memuat simulasi: {error.message}</p>}
          
          {!isLoading && (!labs || labs.length === 0) && (
            <div className="text-center text-muted-foreground py-16 bg-card border rounded-lg">
              <h3 className="text-xl font-semibold">Belum ada simulasi yang diunggah.</h3>
              <p>Jadilah yang pertama mengunggah simulasi interaktif di Lab Virtual!</p>
               <Button asChild className="mt-4">
                <Link href="/lab/upload">
                    Unggah Sekarang
                </Link>
            </Button>
            </div>
          )}

          {labs && labs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <Card key={lab.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden border-b bg-gray-800">
                    <iframe
                        srcDoc={lab.htmlCode}
                        title={`Pratinjau ${lab.title}`}
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin"
                        scrolling="no"
                      />
                      <Link
                          href={`/lab/${lab.id}`}
                          className="absolute inset-0"
                          aria-label={`Buka simulasi ${lab.title}`}
                      />
                  </div>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                      <Badge variant="secondary">{lab.subject}</Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                          <Eye className="h-4 w-4" />
                          <span>{lab.views || 0}</span>
                      </div>
                    </div>
                    <CardTitle className="truncate">{lab.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <Link href={`/user/${lab.userId}`} className="truncate hover:underline">
                        Oleh {lab.authorName}
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end">
                    <Button asChild className="w-full">
                      <Link href={`/lab/${lab.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Buka Simulasi
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
