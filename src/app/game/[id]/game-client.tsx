'use client';

import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, where, limit } from 'firebase/firestore';
import { 
  Loader2, Expand, Eye, User, AlertTriangle, Share2, Copy, Shrink, 
  Gamepad2, Flame, ChevronRight, Home, BookOpen, Layers, Info, HelpCircle, Trophy, Lightbulb 
} from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Interface tetap sama
interface Game { id: string; title: string; description: string; htmlCode: string; class: string; subject: string; views: number; authorName: string; userId: string; }
interface Comment { id: string; userId: string; authorName: string; authorPhotoURL?: string; text: string; createdAt: any; }

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.37 1.23 4.78L2 22l5.31-1.39c1.35.71 2.84 1.13 4.41 1.13h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.5-4.45-9.92-9.91-9.92zm5.42 12.3c-.27.42-1.03.79-1.42.83-.39.04-1.03.2-2.31-.32-1.63-.65-2.93-1.89-3.48-2.89-.17-.31-.35-.61-.35-1.02 0-.39.26-.59.43-.76.17-.17.35-.28.48-.28.13 0 .26 0 .39.01.13.01.3-.08.46.3.2.47.65 1.59.7 1.7.05.11.09.2.02.31-.07.11-.13.17-.26.28-.13.11-.26.17-.37.23-.11.06-.23.12-.33.22-.1.1-.19.22-.09.43.19.42.82 1.48 1.76 2.31.75.67 1.53 1.01 2.31 1.01.2 0 .42-.03.63-.09.28-.08.44-.13.61-.28.17-.15.28-.31.39-.51s.22-.39.3-.56c.08-.17.04-.31-.02-.42-.07-.11-.59-.28-.88-.42-.29-.13-.5-.19-.59-.11-.08.08-.17.17-.23.23-.06.06-.13.11-.19.11-.06 0-.13-.02-.26-.08-.13-.06-.82-.39-1.56-1.12-.74-.74-1.08-1.65-1.12-1.8-.04-.15-.04-.23.06-.33.1-.1.22-.13.31-.2.09-.06.17-.13.26-.2.1-.08.15-.17.22-.28.07-.11.08-.22.06-.31l-.01-.01c-.04-.1-.08-.21-.12-.31l-.01-.03c-.22-.52-.44-1.04-.63-1.56-.19-.52-.39-.44-.54-.44-.13 0-.28-.04-.42-.04h-.09c-.15 0-.39.06-.59.31-.2.25-.79.73-.79 1.78 0 1.04.8 2.06.92 2.21.11.15 1.51 2.46 3.71 3.29 1.83.69 2.53.56 3.01.53.86-.04 1.5-.63 1.71-1.22.2-.59.2-1.09.15-1.22-.06-.13-.22-.2-.46-.31z"></path>
    </svg>
)

export default function GameClient({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [reportUrl, setReportUrl] = useState('');
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Firestore Queries
  const gameDocRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'publishedGames', id) : null), [firestore, id]);
  const { data: game, isLoading } = useDoc<Game>(gameDocRef);

  const commentsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'publishedGames', id, 'comments'), orderBy('createdAt', 'desc')) : null), [firestore, id]);
  const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  const recommendedQuery = useMemoFirebase(() => (firestore && game ? query(collection(firestore, 'publishedGames'), where('subject', '==', game.subject), limit(6)) : null), [firestore, game]);
  const { data: recommendedGames, isLoading: isLoadingRecommended } = useCollection<Game>(recommendedQuery);

  const popularQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'publishedGames'), orderBy('views', 'desc'), limit(4)) : null), [firestore]);
  const { data: popularGames, isLoading: isLoadingPopular } = useCollection<Game>(popularQuery);

  // Effects
  useEffect(() => {
    if (gameDocRef) updateDoc(gameDocRef, { views: increment(1) }).catch(() => {});
  }, [gameDocRef]);

  useEffect(() => {
    if (game) {
      const subject = `Laporan Game: ${game.title}`;
      const body = `Saya melaporkan game ini: ${window.location.href}`;
      setReportUrl(`mailto:admin@mainq.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }, [game]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Tautan disalin!" });
  };

  const handleShareWhatsApp = () => {
    if (!game) return;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Ayo mainkan: ${game.title}\n${window.location.href}`)}`, '_blank');
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'publishedGames', id, 'comments'), {
        userId: user.uid, authorName: user.displayName, authorPhotoURL: user.photoURL,
        text: comment.trim(), createdAt: serverTimestamp(),
      });
      setComment('');
    } finally { setIsSubmitting(false); }
  };

  const filteredRecommended = recommendedGames?.filter(g => g.id !== id).slice(0, 5) || [];

  return (
    <article>
      {/* Breadcrumbs - Bagus untuk Google */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3 h-3" /> Beranda</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/?level=${game?.class}`}>{game?.class || <Skeleton className="w-10 h-4" />}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-foreground truncate">{game?.title}</span>
      </nav>

      {/* Header Utama - H1 Terlihat */}
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">
          {isLoading ? <Skeleton className="h-10 w-3/4" /> : `Media Pembelajaran: ${game?.title}`}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{game?.subject}</Badge>
          <div className="flex items-center gap-1 text-muted-foreground"><User className="w-4 h-4" /> {game?.authorName}</div>
          <div className="flex items-center gap-1 text-muted-foreground"><Eye className="w-4 h-4" /> {game?.views} Views</div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="rounded-full"><Share2 className="w-4 h-4 mr-2" /> Bagikan</Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-full"><Copy className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      {/* Slot Iklan Atas Game */}
      <div className="w-full min-h-[90px] bg-muted/20 border-y mb-8 flex items-center justify-center text-xs text-muted-foreground italic">
        Iklan Atas Permainan
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-10">
          {/* Container Game */}
          <section 
            ref={iframeContainerRef}
            className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800"
          >
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <>
                <iframe
                  title={game?.title}
                  srcDoc={game?.htmlCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
                  allowFullScreen
                />
                <Button 
                  variant="secondary" size="sm" onClick={handleFullscreen}
                  className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/80"
                >
                  {isFullscreen ? <Shrink className="w-4 h-4 mr-2" /> : <Expand className="w-4 h-4 mr-2" />}
                  Layar Penuh
                </Button>
              </>
            )}
          </section>

          {/* Konten Tekstual - Penting untuk AdSense agar tidak Low Value */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Cara Bermain</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Gunakan perangkat Anda (Mouse/Touchscreen) untuk berinteraksi dengan elemen di dalam game. Selesaikan tantangan materi <strong>{game?.subject}</strong> untuk mendapatkan skor terbaik.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-orange-500" /> Manfaat Belajar</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Media ini membantu visualisasi konsep <strong>{game?.subject}</strong> tingkat <strong>{game?.class}</strong>. Membantu siswa belajar mandiri sesuai Kurikulum Merdeka.
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Deskripsi Materi</h2>
            <div className="p-6 bg-secondary/30 rounded-xl border">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed italic">
                {game?.description || "Media pembelajaran interaktif ini dirancang untuk memudahkan proses belajar mengajar di kelas maupun secara mandiri."}
              </p>
            </div>
          </section>

          {/* Slot Iklan Tengah */}
          <div className="w-full min-h-[250px] bg-muted/10 border-dashed border flex items-center justify-center text-xs text-muted-foreground italic">
            Iklan Dalam Konten
          </div>

          {/* Diskusi & Komentar */}
          <section className="pt-10 border-t">
            <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" /> Diskusi & Komentar ({comments?.length || 0})
            </h2>
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
                <Avatar><AvatarImage src={user.photoURL || ''} /><AvatarFallback>U</AvatarFallback></Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tulis masukan Anda..." rows={3} />
                  <div className="flex justify-end"><Button disabled={isSubmitting || !comment.trim()}>{isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Kirim</Button></div>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center border-2 border-dashed rounded-xl mb-10">
                <p className="text-muted-foreground mb-4">Masuk untuk ikut berdiskusi</p>
                <Button asChild variant="outline"><Link href="/login">Login Sekarang</Link></Button>
              </div>
            )}
            <div className="space-y-6">
              {comments?.map(c => (
                <div key={c.id} className="flex gap-4 p-4 bg-muted/20 rounded-xl">
                  <Avatar><AvatarImage src={c.authorPhotoURL} /><AvatarFallback>U</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{c.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">{c.createdAt?.toDate && formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: idLocale })}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Informasi Game</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between"><span>Subjek:</span><span className="font-bold">{game?.subject}</span></div>
              <div className="flex justify-between"><span>Kelas:</span><span className="font-bold">{game?.class}</span></div>
              <div className="flex justify-between"><span>Format:</span><span className="font-bold">HTML5 / Web</span></div>
              <Separator />
              <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" asChild>
                <a href={reportUrl}><AlertTriangle className="w-3 h-3 mr-2" /> Laporkan Konten</a>
              </Button>
            </CardContent>
          </Card>

          {/* Iklan Sidebar */}
          <div className="w-full min-h-[400px] bg-muted/20 border flex items-center justify-center text-xs text-muted-foreground italic sticky top-20">
            Iklan Samping
          </div>

          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Game Sejenis</h3>
            <div className="space-y-3">
              {filteredRecommended.map(rec => (
                <Link key={rec.id} href={`/game/${rec.id}`} className="block p-3 rounded-lg border bg-card hover:border-primary transition-all group">
                  <p className="text-sm font-medium group-hover:text-primary truncate">{rec.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{rec.class} • {rec.views} Views</p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Populer Section */}
      <section className="mt-20 pt-10 border-t">
        <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Game Edukasi Populer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularGames?.map(pop => (
            <Link key={pop.id} href={`/game/${pop.id}`} className="group space-y-3">
              <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative border">
                <iframe srcDoc={pop.htmlCode} className="w-full h-full pointer-events-none opacity-50" scrolling="no" />
                <div className="absolute inset-0 bg-transparent" />
              </div>
              <div>
                <h3 className="font-bold text-sm truncate group-hover:text-primary">{pop.title}</h3>
                <p className="text-[10px] text-muted-foreground">{pop.subject} • {pop.views} Views</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
        }
