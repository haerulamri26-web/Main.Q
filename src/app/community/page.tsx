'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Loader2, MessageSquare, Eye, Plus, BookOpen, PenTool, 
  Lightbulb, HelpCircle, ChevronRight, AlertCircle, Clock, 
  Search, Calendar, User, Filter
} from 'lucide-react';
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
  labels?: string[];
}

const CATEGORIES = [
  { name: 'Semua', icon: BookOpen, value: 'all', color: 'bg-slate-100 text-slate-700' },
  { name: 'Pendidikan', icon: BookOpen, value: 'Pendidikan', color: 'bg-blue-100 text-blue-700' },
  { name: 'Prompting', icon: Lightbulb, value: 'Prompting', color: 'bg-amber-100 text-amber-700' },
  { name: 'Tutorial', icon: PenTool, value: 'Tutorial', color: 'bg-green-100 text-green-700' },
  { name: 'Tanya Jawab', icon: HelpCircle, value: 'Tanya Jawab', color: 'bg-purple-100 text-purple-700' },
];

// ✅ FIX: Strip HTML tags dari content untuk preview
function stripHtmlTags(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ✅ FIX: Truncate text dengan smart word boundary
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

export default function CommunityPage() {
  const firestore = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ✅ FIX: Debounce search query (tunggu 500ms setelah user berhenti mengetik)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } catch (e) {
      console.error("Query Error:", e);
      return null;
    }
  }, [firestore, selectedCategory]);

  const { data: articles, isLoading, error } = useCollection<Article>(articlesQuery);

  // ✅ FIX: Filter artikel berdasarkan pencarian (client-side)
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!debouncedSearch.trim()) return articles;
    
    const searchLower = debouncedSearch.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.authorName.toLowerCase().includes(searchLower) ||
      article.category.toLowerCase().includes(searchLower) ||
      article.labels?.some(label => label.toLowerCase().includes(searchLower))
    );
  }, [articles, debouncedSearch]);

  const ArticleSkeleton = () => (
    <Card className="mb-6 border shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-48 h-32 bg-muted rounded-xl shrink-0 animate-pulse" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 items-center pt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
                📚 Komunitas Guru Kreatif
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 mb-4 tracking-tight">
                Wadah Guru Kreatif
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Temukan inspirasi, tutorial prompting, dan berbagi pengalaman mengajar di era digital.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground">
              <Link href="/community/new">
                <Plus className="mr-2 h-5 w-5" />
                Mulai Menulis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* ✅ Search Bar - FIX: Mudah melakukan pencarian */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Cari artikel, penulis, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          {debouncedSearch && (
            <p className="text-sm text-slate-500 mt-2">
              Menampilkan {filteredArticles.length} hasil untuk "{debouncedSearch}"
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-full px-5 transition-all ${
                selectedCategory === cat.value 
                  ? 'shadow-md border-transparent' 
                  : 'hover:bg-slate-100 border-slate-200'
              }`}
            >
              <cat.icon className="mr-2 h-4 w-4" />
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-4 text-red-700 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold">Gagal memuat artikel</p>
                <p className="text-sm opacity-90">Silakan coba refresh halaman atau hubungi admin.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((article) => {
              // ✅ FIX: Strip HTML tags dari content preview
              const plainContent = stripHtmlTags(article.content);
              const preview = truncateText(plainContent, 180);
              const categoryConfig = CATEGORIES.find(c => c.value === article.category) || CATEGORIES[0];

              return (
                <article key={article.id} className="group">
                  <Link href={`/community/article/${article.id}`}>
                    <Card className="border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* ✅ FIX: Visual card tanpa thumbnail (gunakan warna kategori) */}
                        <div className={`w-full md:w-48 h-32 rounded-xl shrink-0 flex items-center justify-center ${categoryConfig.color} group-hover:scale-105 transition-transform`}>
                          <categoryConfig.icon className="h-12 w-12 opacity-60" />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                            <Badge variant="secondary" className={`${categoryConfig.color} border-none`}>
                              {article.category}
                            </Badge>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {article.createdAt?.toDate 
                                ? formatDistanceToNow(article.createdAt.toDate(), { addSuffix: true, locale: idLocale }) 
                                : 'Baru saja'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              {article.views} x dibaca
                            </span>
                          </div>

                          {/* Title - ✅ FIX: Typography lebih mudah dibaca */}
                          <h2 className="text-2xl md:text-3xl font-bold font-headline text-slate-900 mb-3 group-hover:text-primary transition-colors leading-snug">
                            {article.title}
                          </h2>

                          {/* Preview - ✅ FIX: Tidak ada kode HTML yang tampil */}
                          <p className="text-slate-600 text-base line-clamp-2 mb-4 leading-relaxed flex-grow">
                            {preview}
                          </p>

                          {/* Author & CTA */}
                          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarImage src={article.authorPhotoURL || ''} alt={article.authorName} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {article.authorName?.charAt(0) || 'G'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-700 text-sm">{article.authorName}</p>
                              {article.labels && article.labels.length > 0 && (
                                <p className="text-xs text-slate-500">
                                  {article.labels.slice(0, 3).join(' • ')}
                                </p>
                              )}
                            </div>
                            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold text-sm">
                              Baca Selengkapnya <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : !isLoading && !error ? (
          /* Empty State */
          <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold font-headline text-slate-800 mb-2">
              {debouncedSearch ? 'Tidak ada hasil pencarian' : 'Belum ada artikel'}
            </h3>
            <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
              {debouncedSearch 
                ? `Coba kata kunci lain atau hapus filter pencarian.`
                : 'Jadilah pionir dengan membagikan tulisan pertama Anda!'}
            </p>
            {debouncedSearch ? (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-full">
                Hapus Pencarian
              </Button>
            ) : (
              <Button asChild size="lg" className="rounded-full">
                <Link href="/community/new">Mulai Menulis Sekarang</Link>
              </Button>
            )}
          </div>
        ) : null}

        {/* Stats Footer */}
        {!isLoading && articles && articles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {articles.length} Artikel Tersedia
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {new Set(articles.map(a => a.userId)).size} Penulis Aktif
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()} Total Bacaan
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
