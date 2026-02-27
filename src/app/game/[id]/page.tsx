'use client';

import { useParams } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, where, limit } from 'firebase/firestore';
import { Loader2, Expand, Eye, User, AlertTriangle, Share2, Copy, MessageCircle, Shrink, Gamepad2, Flame, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Game {
  id: string;
  title: string;
  description: string;
  htmlCode: string;
  class: string;
  subject: string;
  views: number;
  authorName: string;
  userId: string;
}

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: any; 
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.37 1.23 4.78L2 22l5.31-1.39c1.35.71 2.84 1.13 4.41 1.13h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.5-4.45-9.92-9.91-9.92zm5.42 12.3c-.27.42-1.03.79-1.42.83-.39.04-1.03.2-2.31-.32-1.63-.65-2.93-1.89-3.48-2.89-.17-.31-.35-.61-.35-1.02 0-.39.26-.59.43-.76.17-.17.35-.28.48-.28.13 0 .26 0 .39.01.13.01.3-.08.46.3.2.47.65 1.59.7 1.7.05.11.09.2.02.31-.07.11-.13.17-.26.28-.13.11-.26.17-.37.23-.11.06-.23.12-.33.22-.1.1-.19.22-.09.43.19.42.82 1.48 1.76 2.31.75.67 1.53 1.01 2.31 1.01.2 0 .42-.03.63-.09.28-.08.44-.13.61-.28.17-.15.28-.31.39-.51s.22-.39.3-.56c.08-.17.04-.31-.02-.42-.07-.11-.59-.28-.88-.42-.29-.13-.5-.19-.59-.11-.08.08-.17.17-.23.23-.06.06-.13.11-.19.11-.06 0-.13-.02-.26-.08-.13-.06-.82-.39-1.56-1.12-.74-.74-1.08-1.65-1.12-1.8-.04-.15-.04-.23.06-.33.1-.1.22-.13.31-.2.09-.06.17-.13.26-.2.1-.08.15-.17.22-.28.07-.11.08-.22.06-.31l-.01-.01c-.04-.1-.08-.21-.12-.31l-.01-.03c-.22-.52-.44-1.04-.63-1.56-.19-.52-.39-.44-.54-.44-.13 0-.28-.04-.42-.04h-.09c-.15 0-.39.06-.59.31-.2.25-.79.73-.79 1.78 0 1.04.8 2.06.92 2.21.11.15 1.51 2.46 3.71 3.29 1.83.69 2.53.56 3.01.53.86-.04 1.5-.63 1.71-1.22.2-.59.2-1.09.15-1.22-.06-.13-.22-.2-.46-.31z"></path>
    </svg>
)

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [reportUrl, setReportUrl] = useState('');
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !gameId) return null;
    return doc(firestore, 'publishedGames', gameId);
  }, [firestore, gameId]);

  const { data: game, isLoading, error } = useDoc<Game>(gameDocRef);

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore || !gameId) return null;
    return query(collection(firestore, 'publishedGames', gameId, 'comments'), orderBy('createdAt', 'desc'));
  }, [firestore, gameId]);

  const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  const recommendedQuery = useMemoFirebase(() => {
    if (!firestore || !game) return null;
    return query(
      collection(firestore, 'publishedGames'),
      where('subject', '==', game.subject),
      limit(6)
    );
  }, [firestore, game]);

  const { data: recommendedGames, isLoading: isLoadingRecommended } = useCollection<Game>(recommendedQuery);

  const popularQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'publishedGames'),
      orderBy('views', 'desc'),
      limit(4)
    );
  }, [firestore]);

  const { data: popularGames, isLoading: isLoadingPopular } = useCollection<Game>(popularQuery);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (gameDocRef) {
      updateDoc(gameDocRef, { views: increment(1) }).catch(err => {
        console.warn("Gagal memperbarui jumlah penayangan:", err.message);
      });
    }
  }, [gameDocRef]);
  
  useEffect(() => {
    if (game && typeof window !== 'undefined') {
        const subject = `Laporan Game: ${game.title} (ID: ${gameId})`;
        const body = `Saya ingin melaporkan game ini karena alasan berikut:\n\n[Jelaskan alasan laporan Anda di sini]\n\n-----------------\nInfo Tambahan:\nURL Game: ${window.location.href}\nID Game: ${gameId}\nJudul Game: ${game.title}`;
        setReportUrl(`mailto:haerulamri26@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }, [game, gameId]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
        if (iframeContainerRef.current) {
            iframeContainerRef.current.requestFullscreen().catch(err => {
                toast({
                    variant: "destructive",
                    title: "Gagal Masuk Mode Layar Penuh",
                    description: err.message || "Browser Anda mungkin tidak mendukung fitur ini.",
                });
            });
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Tautan disalin!", description: "Tautan game telah disalin ke clipboard." });
  };

  const handleShareWhatsApp = () => {
    if (!game) return;
    const text = `Ayo mainkan game seru ini: *${game.title}*!\n\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !gameId || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentsCollection = collection(firestore, 'publishedGames', gameId, 'comments');
      await addDoc(commentsCollection, {
        gameId: gameId,
        userId: user.uid,
        authorName: user.displayName || 'Pengguna Anonim',
        authorPhotoURL: user.photoURL || null,
        text: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal mengirim komentar", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive font-headline">Kesalahan</h1>
        <p>Tidak dapat memuat game. Silakan coba lagi nanti.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }
  
  if (!isLoading && !game) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Game tidak ditemukan</h1>
        <p>Game ini tidak ada atau telah dihapus.</p>
        <Button asChild className="mt-4">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  }

  const jsonLd = game ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": game.title,
    "description": game.description || `Mainkan game edukasi ${game.title} untuk mata pelajaran ${game.subject}.`,
    "applicationCategory": "EducationalGame",
    "operatingSystem": "Web",
    "author": {
      "@type": "Person",
      "name": game.authorName
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  } : null;

  const filteredRecommended = recommendedGames?.filter(g => g.id !== gameId).slice(0, 5) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* Game Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        {isLoading ? (
          <div className="space-y-2 w-full max-w-md">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold truncate font-headline">{game?.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <User className="h-5 w-5" />
              <span className="text-base">
                Dibuat oleh{' '}
                <Link href={`/user/${game?.userId}`} className="font-semibold text-foreground hover:underline">
                  {game?.authorName}
                </Link>
              </span>
            </div>
          </div>
        )}

        {game && (
          <div className="flex items-center gap-2 flex-shrink-0 self-start pt-2">
            <Badge variant="outline">{game.class}</Badge>
            <Badge variant="outline">{game.subject}</Badge>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-5 w-5" />
              <span className="font-medium text-sm">{game.views || 0}</span>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" title="Bagikan & Laporkan">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="justify-start px-2" onClick={handleShareWhatsApp}>
                      <WhatsAppIcon className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start px-2" onClick={handleCopyLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Salin Tautan
                    </Button>
                    <Separator className="my-1" />
                    <Button variant="ghost" asChild size="sm" className="justify-start px-2 text-destructive hover:text-destructive">
                        <a href={reportUrl} target="_blank" rel="noopener noreferrer">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Laporkan
                        </a>
                    </Button>
                  </div>
                </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      
      {/* Game Frame */}
      <div 
        ref={iframeContainerRef}
        className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border"
      >
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : game && (
          <>
            <iframe
              title={game.title}
              srcDoc={game.htmlCode}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
              allowFullScreen
              loading="lazy"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleFullscreen} 
              title={isFullscreen ? "Keluar dari Mode Penuh" : "Mode Penuh"}
              className="absolute top-3 right-3 z-10 bg-black/30 text-white hover:bg-black/50 border-white/50"
            >
              {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>

      <div className="mt-12 space-y-8 max-w-3xl mx-auto">
        {/* Description Section */}
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">Tentang Game Ini</h2>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : game && (
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {game.description || `Jelajahi game interaktif "${game.title}" yang dibuat oleh ${game.authorName}. Game ini dirancang untuk mata pelajaran ${game.subject} dan cocok untuk level ${game.class}. Buka dalam mode layar penuh untuk pengalaman terbaik!`}
              </p>
            )}
        </div>

        {/* Learning Goal Section */}
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">Tujuan Pembelajaran</h2>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : game && (
              <p className="text-foreground/80 leading-relaxed">
                  Game edukasi ini bertujuan untuk memberikan cara yang menyenangkan bagi para siswa untuk terlibat dengan materi pelajaran <strong>{game.subject}</strong>. Dengan mengubah pembelajaran menjadi sebuah permainan, diharapkan dapat meningkatkan retensi pengetahuan, keterampilan pemecahan masalah, dan motivasi belajar.
              </p>
            )}
        </div>

        {/* Recommended Games Section */}
        <div className="pt-6">
          <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            Rekomendasi Serupa
          </h2>
          {isLoadingRecommended ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filteredRecommended.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRecommended.map((rec) => (
                <Link 
                  key={rec.id} 
                  href={`/game/${rec.id}`} 
                  className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary transition-colors"
                >
                  <span className="font-medium group-hover:text-primary truncate mr-2">{rec.title}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">Belum ada rekomendasi untuk mata pelajaran ini.</p>
          )}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-primary" />
            Diskusi & Komentar ({comments?.length || 0})
        </h2>
        
        {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback>{(user.displayName?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                <Textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tulis komentar Anda di sini..."
                    className="mb-2"
                    disabled={isSubmitting}
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={!comment.trim() || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim
                    </Button>
                </div>
                </div>
            </div>
            </form>
        ) : (
            <div className="mb-8 text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
            <Link href="/login" className="font-semibold text-primary hover:underline">Masuk</Link> untuk meninggalkan komentar.
            </div>
        )}

        <div className="space-y-6">
            {isLoadingComments ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
            ) : comments && comments.length > 0 ? (
            comments.map(c => (
                <div key={c.id} className="flex items-start gap-4">
                <Avatar className="border">
                    <AvatarImage src={c.authorPhotoURL || ''} alt={c.authorName} />
                    <AvatarFallback>{(c.authorName.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{c.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                            &bull; {c.createdAt?.toDate ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: idLocale }) : ''}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{c.text}</p>
                </div>
                </div>
            ))
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <h3 className="font-semibold">Belum ada komentar</h3>
                    <p>Jadilah yang pertama berkomentar di game ini.</p>
                </div>
            )}
        </div>
      </div>

      {/* Popular Games Section */}
      <div className="mt-20 pt-10 border-t">
        <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          Game Populer Lainnya
        </h2>
        {isLoadingPopular ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/5] w-full" />)}
          </div>
        ) : popularGames && popularGames.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularGames.map((pop) => (
                <Card key={pop.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden border-b bg-gray-800">
                    <iframe
                      srcDoc={pop.htmlCode}
                      title={pop.title}
                      className="w-full h-full pointer-events-none"
                      sandbox="allow-scripts allow-same-origin"
                      scrolling="no"
                      loading="lazy"
                    />
                    <Link href={`/game/${pop.id}`} className="absolute inset-0" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm leading-snug truncate mb-1">{pop.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto">
                      <Badge variant="secondary" className="px-1 py-0 h-4">{pop.class}</Badge>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{pop.views}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/popular">Lihat Semua Game Populer</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">Belum ada game populer yang ditampilkan.</p>
        )}
      </div>
    </div>
  );
}
