
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, Eye, Plus, BookOpen, PenTool, Lightbulb, HelpCircle, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  views: number;
}

const CATEGORIES = [
  { name: 'Semua', icon: BookOpen, value: 'all' },
  { name: 'Pendidikan', icon: BookOpen, value: 'Pendidikan' },
  { name: 'Prompting', icon: Lightbulb, value: 'Prompting' },
  { name: 'Tutorial', icon: PenTool, value: 'Tutorial' },
  { name: 'Tanya Jawab', icon: HelpCircle, value: 'Tanya Jawab' },
];

export default function CommunityPage() {
  const firestore = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const articlesCol = collection(firestore, 'articles');
    
    try {
        if (selectedCategory === 'all') {
          return query(articlesCol, orderBy('createdAt', 'desc'), limit(50));
        }
        
        return query(
          articlesCol,
          where('category', '==', selectedCategory),
          limit(50)
        );
    } catch (e) {
        console.error("Query Error:", e);
        return null;
    }
  }, [firestore, selectedCategory]);

  const { data: articles, isLoading, error } = useCollection<Article>(articlesQuery);

  const ArticleSkeleton = () => (
    <Card className="mb-6 border-none shadow-none bg-transparent">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-48 w-full md:w-64 rounded-xl shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b pb-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4 tracking-tight">Wadah Guru Kreatif</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Temukan inspirasi, tutorial prompting, dan berbagi pengalaman mengajar di era digital.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
          <Link href="/community/new">
            <Plus className="mr-2 h-5 w-5" />
            Mulai Menulis
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'ghost'}
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-full px-6 ${selectedCategory === cat.value ? 'shadow-md' : 'hover:bg-muted'}`}
          >
            <cat.icon className="mr-2 h-4 w-4" />
            {cat.name}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10 mb-8">
          <CardContent className="p-4 text-destructive flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
                <p className="font-bold">Gagal memuat artikel</p>
                <p className="text-sm opacity-90">Silakan coba refresh halaman atau hubungi admin.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => <ArticleSkeleton key={i} />)}
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="space-y-16">
          {articles.map((article) => (
            <article key={article.id} className="group relative">
              <Link href={`/community/article/${article.id}`} className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
                <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-black border-none hover:bg-white">
                    {article.category}
                  </Badge>
                </div>
                
                <div className="flex flex-col h-full py-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {article.createdAt?.toDate ? formatDistanceToNow(article.createdAt.toDate(), { addSuffix: true, locale: idLocale }) : 'Baru saja'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {article.views} Bacaan</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-lg line-clamp-2 mb-6 leading-relaxed flex-grow">
                    {article.content}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-auto">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={article.authorPhotoURL || ''} alt={article.authorName} />
                      <AvatarFallback>{article.authorName?.charAt(0) || 'G'}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm">{article.authorName}</span>
                    <div className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold text-sm">
                      Baca Artikel <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : !isLoading && !error && (
        <div className="text-center py-24 bg-muted/20 border-2 border-dashed rounded-3xl">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold font-headline mb-2">Belum ada artikel</h3>
          <p className="text-muted-foreground text-lg mb-8">Jadilah pionir dengan membagikan tulisan pertama Anda!</p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/community/new">Mulai Menulis Sekarang</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

