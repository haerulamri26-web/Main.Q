'use client';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Loader2, Eye, MessageCircle, Calendar, Send, Share2, Bookmark, MoreHorizontal, Clock, Tag, Heart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { AdUnit } from '@/components/AdSense';

interface Article {
  id: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  title: string;
  content: string;
  category: string;
  labels?: string[];
  createdAt: any;
  views: number;
}

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: any;
}

export default function ArticleClient({ article }: { article: Article }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likes, setLikes] = useState(0);

  const articleRef = useMemoFirebase(() => (firestore && article.id ? doc(firestore, 'articles', article.id) : null), [firestore, article.id]);
  
  const commentsQuery = useMemoFirebase(() => (firestore && article.id ? query(collection(firestore, 'articles', article.id, 'comments'), orderBy('createdAt', 'desc')) : null), [firestore, article.id]);
  const {  comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  // Increment views
  useEffect(() => {
    if (articleRef) {
      updateDoc(articleRef, { views: increment(1) }).catch(() => {});
    }
  }, [articleRef]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !article || !commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'articles', article.id, 'comments'), {
        userId: user.uid,
        authorName: user.displayName || 'Guru Anonim',
        authorPhotoURL: user.photoURL || null,
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });

      if (article.userId !== user.uid) {
        await addDoc(collection(firestore, 'notifications'), {
          userId: article.userId,
          senderName: user.displayName || 'Seseorang',
          contentTitle: article.title,
          contentLink: `/community/article/${article.id}`,
          type: 'comment',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setCommentText('');
      toast({ title: '💬 Komentar terkirim!' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: '✅ Tautan disalin!' });
    }
  };

  // Process content to render YouTube embeds properly
  const processContent = (content: string) => {
    // Convert YouTube embed divs to proper responsive containers
    return content.replace(
      /<div class="youtube-embed".*?<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)".*?<\/iframe>.*?<\/div>/gs,
      '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0; border-radius: 12px;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" src="https://www.youtube.com/embed/$1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 max-w-3xl pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/community" className="hover:text-primary">Komunitas</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/community?category=${article.category.toLowerCase()}`} className="hover:text-primary">{article.category}</Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-8 leading-[1.1] tracking-tight text-foreground">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between border-y py-6 mb-12">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border shadow-sm">
                <AvatarImage src={article.authorPhotoURL || ''} alt={article.authorName} />
                <AvatarFallback>{article.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">{article.authorName}</p>
                  <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded-full">Penulis</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />{' '}
                    {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'dd MMMM yyyy', { locale: idLocale }) : ''}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {article.views} Tayangan
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* AdSense: Top */}
        <AdUnit slot="1234567890" className="w-full min-h-[90px] bg-muted/20 border-y mb-8 flex items-center justify-center text-xs text-muted-foreground" />

        {/* Content */}
        <article 
          className="prose prose-lg md:prose-xl dark:prose-invert max-w-none mb-20 prose-headings:font-headline prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-pre:bg-zinc-900 prose-pre:text-zinc-100"
          dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
        />

        {/* Labels */}
        {article.labels && article.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 items-center">
            <Tag className="h-4 w-4 text-muted-foreground mr-2" />
            {article.labels.map((label, idx) => (
              <Badge key={idx} variant="secondary" className="rounded-full px-3 py-1 font-medium">
                #{label}
              </Badge>
            ))}
          </div>
        )}

        {/* Author Box */}
        <div className="bg-muted/30 rounded-3xl p-8 mb-20 border">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={article.authorPhotoURL || ''} alt={article.authorName} />
              <AvatarFallback>{article.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold font-headline mb-1">Ditulis oleh {article.authorName}</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Guru kreatif yang berdedikasi tinggi untuk memajukan pendidikan melalui teknologi dan media interaktif di Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* AdSense: Middle */}
        <AdUnit slot="0987654321" format="rectangle" className="w-full min-h-[250px] flex items-center justify-center my-8" />

        {/* Comments */}
        <section className="pt-12 border-t">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              Diskusi ({comments?.length || 0})
            </h2>
          </div>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-16">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Apa pendapat Anda tentang artikel ini?"
                    className="min-h-[120px] rounded-2xl shadow-sm border-2 focus-visible:border-primary transition-all p-4 text-base"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!commentText.trim() || isSubmitting} className="rounded-full px-8 shadow-lg">
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Kirim Komentar
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-card p-10 rounded-3xl border-2 border-dashed text-center mb-16 shadow-inner">
              <p className="text-xl font-medium text-muted-foreground mb-6">Ingin bergabung dalam diskusi guru kreatif?</p>
              <Button asChild size="lg" className="rounded-full px-10">
                <Link href="/login">Masuk Sekarang</Link>
              </Button>
            </div>
          )}

          <div className="space-y-10">
            {isLoadingComments ? (
              <div className="flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : comments && comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="flex gap-6 group">
                  <Avatar className="h-12 w-12 border shadow-sm shrink-0">
                    <AvatarImage src={c.authorPhotoURL || ''} alt={c.authorName} />
                    <AvatarFallback>{c.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-base hover:text-primary cursor-pointer transition-colors">{c.authorName}</p>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {c.createdAt?.toDate ? format(c.createdAt.toDate(), 'HH:mm - dd MMM yyyy', { locale: idLocale }) : ''}
                      </span>
                    </div>
                    <div className="text-lg leading-relaxed text-foreground/80 bg-muted/20 p-6 rounded-2xl rounded-tl-none group-hover:bg-muted/40 transition-colors">
                      {c.text}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Jadilah yang pertama memberikan apresiasi pada penulis!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
