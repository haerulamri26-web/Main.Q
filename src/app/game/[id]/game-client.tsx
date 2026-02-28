'use client';

import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, where, limit } from 'firebase/firestore';
import { 
  Loader2, Expand, Eye, User, AlertTriangle, Share2, Copy, Shrink, 
  Gamepad2, Flame, ChevronRight, Home, BookOpen, Layers, Info, HelpCircle, Trophy, Lightbulb,
  GraduationCap, Clock, Target, CheckCircle, ChevronDown, ChevronUp
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ============================================================================
// INTERFACES
// ============================================================================
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
  createdAt?: any;
}
interface Comment { 
  id: string; 
  userId: string; 
  authorName: string; 
  authorPhotoURL?: string; 
  text: string; 
  createdAt: any; 
}

// ============================================================================
// ICONS
// ============================================================================
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.37 1.23 4.78L2 22l5.31-1.39c1.35.71 2.84 1.13 4.41 1.13h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.5-4.45-9.92-9.91-9.92zm5.42 12.3c-.27.42-1.03.79-1.42.83-.39.04-1.03.2-2.31-.32-1.63-.65-2.93-1.89-3.48-2.89-.17-.31-.35-.61-.35-1.02 0-.39.26-.59.43-.76.17-.17.35-.28.48-.28.13 0 .26 0 .39.01.13.01.3-.08.46.3.2.47.65 1.59.7 1.7.05.11.09.2.02.31-.07.11-.13.17-.26.28-.13.11-.26.17-.37.23-.11.06-.23.12-.33.22-.1.1-.19.22-.09.43.19.42.82 1.48 1.76 2.31.75.67 1.53 1.01 2.31 1.01.2 0 .42-.03.63-.09.28-.08.44-.13.61-.28.17-.15.28-.31.39-.51s.22-.39.3-.56c.08-.17.04-.31-.02-.42-.07-.11-.59-.28-.88-.42-.29-.13-.5-.19-.59-.11-.08.08-.17.17-.23.23-.06.06-.13.11-.19.11-.06 0-.13-.02-.26-.08-.13-.06-.82-.39-1.56-1.12-.74-.74-1.08-1.65-1.12-1.8-.04-.15-.04-.23.06-.33.1-.1.22-.13.31-.2.09-.06.17-.13.26-.2.1-.08.15-.17.22-.28.07-.11.08-.22.06-.31l-.01-.01c-.04-.1-.08-.21-.12-.31l-.01-.03c-.22-.52-.44-1.04-.63-1.56-.19-.52-.39-.44-.54-.44-.13 0-.28-.04-.42-.04h-.09c-.15 0-.39.06-.59.31-.2.25-.79.73-.79 1.78 0 1.04.8 2.06.92 2.21.11.15 1.51 2.46 3.71 3.29 1.83.69 2.53.56 3.01.53.86-.04 1.5-.63 1.71-1.22.2-.59.2-1.09.15-1.22-.06-.13-.22-.2-.46-.31z"/>
  </svg>
);

// ============================================================================
// HELPER: Auto-Generate FAQ Content
// ============================================================================
function generateFAQItems(subject: string, grade: string) {
  return [
    {
      q: `Apakah game "${subject}" ini cocok untuk ${grade}?`,
      a: `Ya, game ini dirancang khusus sesuai Capaian Pembelajaran (CP) Kurikulum Merdeka untuk jenjang ${grade}. Materi disajikan dengan pendekatan gamifikasi agar siswa lebih tertarik belajar.`
    },
    {
      q: 'Apakah perlu koneksi internet untuk memainkan game ini?',
      a: 'Game ini berbasis HTML5 yang sudah dimuat di halaman, sehingga setelah halaman terbuka, game dapat dimainkan dengan stabil. Namun, koneksi internet tetap diperlukan untuk memuat halaman awal dan menyimpan progres.'
    },
    {
      q: 'Bagaimana cara menggunakan game ini di kelas?',
      a: 'Guru dapat memproyeksikan game ke layar kelas untuk pembelajaran interaktif, atau membagikan link ke siswa untuk belajar mandiri. Gunakan fitur "Layar Penuh" untuk pengalaman terbaik.'
    },
    {
      q: 'Apakah data siswa disimpan?',
      a: 'Game ini fokus pada pembelajaran interaktif. Untuk fitur penyimpanan progres atau kuis dengan nilai, silakan hubungi pembuat game untuk informasi lebih lanjut.'
    }
  ];
}

// ============================================================================
// HELPER: Subject Display Name
// ============================================================================
function getSubjectDisplayName(subject: string): string {
  const map: Record<string, string> = {
    'matematika': 'Matematika',
    'agama': 'Pendidikan Agama & Budi Pekerti',
    'ipa': 'Ilmu Pengetahuan Alam (IPA)',
    'ips': 'Ilmu Pengetahuan Sosial (IPS)',
    'bahasa': 'Bahasa Indonesia',
    'ppkn': 'Pendidikan Pancasila & Kewarganegaraan',
    'seni': 'Seni Budaya & Prakarya',
    'informatika': 'Informatika',
  };
  return map[subject?.toLowerCase()] || subject;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function GameClient({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [reportUrl, setReportUrl] = useState('');
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

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
      const body = `Saya melaporkan game ini: ${window.location.href}\n\nAlasan:`;
      setReportUrl(`mailto:admin@mainq.my.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }, [game]);

  // ✅ Inject Client-Side JSON-LD (FAQ) - Fallback jika server-side tidak cukup
  useEffect(() => {
    if (!game) return;
    
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": generateFAQItems(game.subject, game.class).map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
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
    toast({ title: "✅ Tautan disalin!", description: "Silakan bagikan ke siswa atau rekan guru." });
  };

  const handleShareWhatsApp = () => {
    if (!game) return;
    const text = `🎮 Ayo mainkan: ${game.title}\n\nMedia pembelajaran interaktif untuk ${getSubjectDisplayName(game.subject)} ${game.class}.\n\n🔗 ${window.location.href}\n\n#GameEdukasi #MAINQ #KurikulumMerdeka`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
      toast({ title: "💬 Komentar terkirim!", variant: "default" });
    } catch (err) {
      toast({ title: "❌ Gagal mengirim komentar", variant: "destructive" });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const filteredRecommended = recommendedGames?.filter(g => g.id !== id).slice(0, 5) || [];
  const subjectDisplay = getSubjectDisplayName(game?.subject || '');
  const faqItems = game ? generateFAQItems(game.subject, game.class) : [];

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Game tidak ditemukan</h2>
        <p className="text-muted-foreground mb-6">Mungkin game sudah dihapus atau link tidak valid.</p>
        <Button asChild><Link href="/games">← Kembali ke Daftar Game</Link></Button>
      </div>
    );
  }

  return (
    <article itemscope itemtype="https://schema.org/LearningResource">
      {/* ✅ Breadcrumbs - SEO Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary flex items-center gap-1 transition-colors">
          <Home className="w-3 h-3" /> Beranda
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <Link href={`/?level=${game.class}`} className="hover:text-primary transition-colors">
          {game.class}
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <Link href={`/?subject=${game.subject}`} className="hover:text-primary transition-colors">
          {subjectDisplay}
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-medium text-foreground truncate" itemprop="name">{game.title}</span>
      </nav>

      {/* ✅ Header Utama - H1 dengan Schema */}
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline" itemprop="name">
          {game.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none" itemprop="about">
            {subjectDisplay}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="w-4 h-4" /> 
            <span itemprop="author" itemtype="https://schema.org/Person" itemscope>
              <span itemprop="name">{game.authorName}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="w-4 h-4" /> 
            <span itemprop="interactionStatistic" itemtype="https://schema.org/InteractionCounter" itemscope>
              <span itemprop="userInteractionCount">{game.views}</span> Views
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <time dateTime={game.createdAt?.toDate?.().toISOString()} itemprop="datePublished">
              {game.createdAt?.toDate && formatDistanceToNow(game.createdAt.toDate(), { addSuffix: true, locale: idLocale })}
            </time>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="rounded-full">
              <WhatsAppIcon /> Bagikan
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-full" title="Salin tautan">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ✅ AdSense Slot: Atas Game (Responsive) */}
      <div className="w-full min-h-[90px] bg-muted/20 border-y mb-8 flex items-center justify-center text-xs text-muted-foreground">
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-8378725062743955"
             data-ad-slot="1234567890" 
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* ✅ Main Content Column */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* 🎮 Game Container */}
          <section 
            ref={iframeContainerRef}
            className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800"
            aria-label={`Game interaktif: ${game.title}`}
          >
            <iframe
              title={game.title}
              srcDoc={game.htmlCode}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals allow-top-navigation-by-user-activation"
              allowFullScreen
              loading="lazy"
            />
            <Button 
              variant="secondary" size="sm" onClick={handleFullscreen}
              className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition-all"
              aria-label={isFullscreen ? "Keluar dari layar penuh" : "Masuk layar penuh"}
            >
              {isFullscreen ? <Shrink className="w-4 h-4 mr-2" /> : <Expand className="w-4 h-4 mr-2" />}
              {isFullscreen ? "Keluar" : "Layar Penuh"}
            </Button>
          </section>

          {/* ✅ Quick Info Cards - Teks SEO Tambahan */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tujuan</p>
                    <p className="font-semibold text-sm">Pemahaman Konsep {subjectDisplay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Jenjang</p>
                    <p className="font-semibold text-sm">{game.class}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Format</p>
                    <p className="font-semibold text-sm">HTML5 Interaktif</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ✅ Cara Bermain & Manfaat (Auto-Enriched Content) */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" /> 
                  Cara Bermain
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Klik tombol "Mulai" pada game untuk memulai sesi belajar.</li>
                  <li>Gunakan <strong>mouse atau sentuhan</strong> untuk menjawab pertanyaan dan menyelesaikan tantangan.</li>
                  <li>Perhatikan instruksi di setiap level untuk memahami tujuan pembelajaran.</li>
                  <li>Ulangi permainan untuk memperkuat pemahaman konsep {subjectDisplay.toLowerCase()}.</li>
                </ol>
                <p className="text-xs bg-muted/50 p-3 rounded-lg mt-3">
                  💡 <strong>Tip:</strong> Mainkan game ini di perangkat dengan layar yang cukup besar untuk pengalaman terbaik.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-500" /> 
                  Manfaat Belajar
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Visualisasi interaktif membantu pemahaman konsep {subjectDisplay} yang abstrak.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pendekatan gamifikasi meningkatkan motivasi dan keterlibatan siswa.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cocok untuk pembelajaran mandiri, tugas rumah, atau aktivitas kelas.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Disusun sesuai prinsip Kurikulum Merdeka untuk jenjang {game.class}.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* ✅ Deskripsi Materi (Dengan Fallback Auto-Enrichment) */}
          <section className="space-y-4" itemProp="description">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> 
              Deskripsi Materi
            </h2>
            <div className="p-6 bg-secondary/30 rounded-xl border prose prose-sm dark:prose-invert max-w-none">
              {game.description?.trim() ? (
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                  {game.description}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>{game.title}</strong> adalah media pembelajaran interaktif untuk mata pelajaran 
                    <strong> {subjectDisplay}</strong> jenjang <strong>{game.class}</strong>. 
                    Game ini dirancang untuk membantu siswa memahami konsep melalui pendekatan gamifikasi yang menyenangkan.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Melalui aktivitas interaktif dalam game, siswa dapat melatih kemampuan berpikir kritis, 
                    pemecahan masalah, dan penguasaan materi {subjectDisplay.toLowerCase()} secara mandiri 
                    sesuai dengan gaya belajar generasi digital.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ✅ AdSense Slot: Dalam Konten (Rectangle) */}
          <div className="w-full min-h-[250px] bg-muted/10 border-dashed border flex items-center justify-center text-xs text-muted-foreground">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-8378725062743955"
                 data-ad-slot="0987654321"
                 data-ad-format="rectangle"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          </div>

          {/* ✅ Panduan untuk Guru (Nilai Tambah Tinggi untuk AdSense) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" /> 
              Panduan untuk Guru
            </h2>
            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="pt-6">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">🎯 Sebelum Menggunakan</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Pastikan perangkat siswa terhubung internet stabil.</li>
                      <li>Uji coba game terlebih dahulu untuk memahami alur permainan.</li>
                      <li>Siapkan pertanyaan pemantik untuk diskusi setelah permainan.</li>
                    </ul>
                  </div>
                  <Separator className="bg-amber-200" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">🚀 Saat Pembelajaran</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Jelaskan tujuan pembelajaran sebelum siswa memulai game.</li>
                      <li>Biarkan siswa mengeksplorasi secara mandiri, dampingi jika ada kesulitan.</li>
                      <li>Catat poin-poin penting yang muncul selama permainan untuk bahan refleksi.</li>
                    </ul>
                  </div>
                  <Separator className="bg-amber-200" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">📝 Setelah Permainan</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Adakan diskusi kelas: "Apa yang kalian pelajari dari game ini?"</li>
                      <li>Hubungkan pengalaman game dengan materi teori di buku pelajaran.</li>
                      <li>Berikan tugas lanjutan untuk memperkuat pemahaman konsep.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ✅ FAQ Section (Collapsible - Bagus untuk SEO & UX) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" /> 
              Pertanyaan Umum
            </h2>
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <Collapsible 
                  key={index}
                  open={openFAQ === item.q}
                  onOpenChange={() => setOpenFAQ(openFAQ === item.q ? null : item.q)}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-left font-medium h-auto p-4 hover:bg-muted/50"
                    >
                      <span>{item.q}</span>
                      {openFAQ === item.q ? 
                        <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" /> : 
                        <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
                    {item.a}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </section>

          {/* ✅ Diskusi & Komentar (Engagement Signal) */}
          <section className="pt-10 border-t" id="komentar">
            <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" /> 
              Diskusi & Komentar ({comments?.length || 0})
            </h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    placeholder="Bagikan pengalaman atau masukan Anda tentang game ini..." 
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setComment('')}>
                      Batal
                    </Button>
                    <Button disabled={isSubmitting || !comment.trim()} size="sm">
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} 
                      Kirim Komentar
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <Card className="mb-10">
                <CardContent className="pt-6 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Masuk untuk ikut berdiskusi dan berbagi pengalaman</p>
                  <Button asChild variant="outline">
                    <Link href="/login">Login Sekarang</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4">
              {isLoadingComments ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))
              ) : comments?.length ? (
                comments.map(c => (
                  <div key={c.id} className="flex gap-4 p-4 bg-muted/20 rounded-xl">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.authorPhotoURL} alt={c.authorName} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{c.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.createdAt?.toDate && formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: idLocale })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Belum ada komentar. Jadilah yang pertama berbagi!</p>
              )}
            </div>
          </section>
        </div>

        {/* ✅ Sidebar Column */}
        <aside className="space-y-8">
          
          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" /> Informasi Game
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subjek:</span>
                <span className="font-semibold">{subjectDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jenjang:</span>
                <span className="font-semibold">{game.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-semibold">HTML5 / Web</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bahasa:</span>
                <span className="font-semibold">Indonesia</span>
              </div>
              <Separator />
              <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start" asChild>
                <a href={reportUrl}>
                  <AlertTriangle className="w-3 h-3 mr-2" /> Laporkan Konten
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* ✅ AdSense Slot: Sidebar (Vertical) */}
          <div className="w-full min-h-[400px] bg-muted/20 border flex items-center justify-center text-xs text-muted-foreground sticky top-20">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-8378725062743955"
                 data-ad-slot="1122334455"
                 data-ad-format="vertical"
                 data-full-width-responsive="false"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          </div>

          {/* Game Sejenis */}
          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> 
              Game Sejenis
            </h3>
            <div className="space-y-3">
              {isLoadingRecommended ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
              ) : filteredRecommended.length ? (
                filteredRecommended.map(rec => (
                  <Link 
                    key={rec.id} 
                    href={`/game/${rec.id}`} 
                    className="block p-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <p className="text-sm font-medium group-hover:text-primary line-clamp-2">{rec.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{rec.class} • {rec.views} Views</p>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada game sejenis.</p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link href={`/?subject=${game.subject}`}>
                Lihat semua game {subjectDisplay} →
              </Link>
            </Button>
          </section>

          {/* Popular Games */}
          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> 
              Paling Populer
            </h3>
            <div className="space-y-3">
              {isLoadingPopular ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
              ) : popularGames?.slice(0, 3).map(pop => (
                <Link 
                  key={pop.id} 
                  href={`/game/${pop.id}`} 
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-16 h-12 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full opacity-50" style={{ backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary">{pop.title}</p>
                    <p className="text-[10px] text-muted-foreground">{pop.views} Views</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* ✅ Final CTA Section */}
      <section className="mt-20 pt-10 border-t text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold">🎮 Jelajahi Lebih Banyak Game Edukasi</h3>
          <p className="text-muted-foreground">
            Temukan ratusan media pembelajaran interaktif lainnya untuk berbagai mata pelajaran dan jenjang.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/games">Lihat Semua Game</Link>
            </Button>
            <Button asChild>
              <Link href="/?subject=matematika">Game Matematika</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/?subject=agama">Game Agama</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
