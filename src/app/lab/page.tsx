'use client';

import { useParams } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Loader2, Expand, Eye, User, AlertTriangle, Share2, Copy, MessageCircle, Shrink } from 'lucide-react';
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

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: any; // Firestore timestamp
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.37 1.23 4.78L2 22l5.31-1.39c1.35.71 2.84 1.13 4.41 1.13h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.5-4.45-9.92-9.91-9.92zm5.42 12.3c-.27.42-1.03.79-1.42.83-.39.04-1.03.2-2.31-.32-1.63-.65-2.93-1.89-3.48-2.89-.17-.31-.35-.61-.35-1.02 0-.39.26-.59.43-.76.17-.17.35-.28.48-.28.13 0 .26 0 .39.01.13.01.3-.08.46.3.2.47.65 1.59.7 1.7.05.11.09.2.02.31-.07.11-.13.17-.26.28-.13.11-.26.17-.37.23-.11.06-.23.12-.33.22-.1.1-.19.22-.09.43.19.42.82 1.48 1.76 2.31.75.67 1.53 1.01 2.31 1.01.2 0 .42-.03.63-.09.28-.08.44-.13.61-.28.17-.15.28-.31.39-.51s.22-.39.3-.56c.08-.17.04-.31-.02-.42-.07-.11-.59-.28-.88-.42-.29-.13-.5-.19-.59-.11-.08.08-.17.17-.23.23-.06.06-.13.11-.19.11-.06 0-.13-.02-.26-.08-.13-.06-.82-.39-1.56-1.12-.74-.74-1.08-1.65-1.12-1.8-.04-.15-.04-.23.06-.33.1-.1.22-.13.31-.2.09-.06.17-.13.26-.2.1-.08.15-.17.22-.28.07-.11.08-.22.06-.31l-.01-.01c-.04-.1-.08-.21-.12-.31l-.01-.03c-.22-.52-.44-1.04-.63-1.56-.19-.52-.39-.44-.54-.44-.13 0-.28-.04-.42-.04h-.09c-.15 0-.39.06-.59.31-.2.25-.79.73-.79 1.78 0 1.04.8 2.06.92 2.21.11.15 1.51 2.46 3.71 3.29 1.83.69 2.53.56 3.01.53.86-.04 1.5-.63 1.71-1.22.2-.59.2-1.09.15-1.22-.06-.13-.22-.2-.46-.31z"></path>
    </svg>
)

export default function LabPage() {
  const params = useParams();
  const labId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [reportUrl, setReportUrl] = useState('');
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const labDocRef = useMemoFirebase(() => {
    if (!firestore || !labId) return null;
    return doc(firestore, 'publishedLabs', labId);
  }, [firestore, labId]);

  const { data: lab, isLoading, error } = useDoc<Lab>(labDocRef);

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore || !labId) return null;
    return query(collection(firestore, 'publishedLabs', labId, 'comments'), orderBy('createdAt', 'desc'));
  }, [firestore, labId]);

  const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

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
    if (labDocRef) {
      updateDoc(labDocRef, { views: increment(1) }).catch(err => {
        console.warn("Gagal memperbarui jumlah penayangan:", err.message);
      });
    }
  }, [labDocRef]);
  
  useEffect(() => {
    if (lab && typeof window !== 'undefined') {
        const subject = `Laporan Simulasi: ${lab.title} (ID: ${labId})`;
        const body = `Saya ingin melaporkan simulasi ini karena alasan berikut:\n\n[Jelaskan alasan laporan Anda di sini]\n\n-----------------\nInfo Tambahan:\nURL Simulasi: ${window.location.href}\nID Simulasi: ${labId}\nJudul Simulasi: ${lab.title}`;
        setReportUrl(`mailto:haerulamri26@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }, [lab, labId]);

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
    toast({ title: "Tautan disalin!", description: "Tautan simulasi telah disalin ke clipboard." });
  };

  const handleShareWhatsApp = () => {
    if (!lab) return;
    const text = `Coba simulasi keren ini: *${lab.title}*!\n\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !labId || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentsCollection = collection(firestore, 'publishedLabs', labId, 'comments');
      await addDoc(commentsCollection, {
        labId: labId,
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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Memuat simulasi...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive font-headline">Kesalahan</h1>
        <p>Tidak dapat memuat simulasi. Silakan coba lagi nanti.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }
  
  if (!lab) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Simulasi tidak ditemukan</h1>
        <p>Simulasi ini tidak ada atau telah dihapus.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold truncate font-headline">{lab.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <User className="h-5 w-5" />
            <span className="text-base">
              Dibuat oleh{' '}
              <Link href={`/user/${lab.userId}`} className="font-semibold text-foreground hover:underline">
                {lab.authorName}
              </Link>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-start pt-2">
          <Badge variant="outline">{lab.subject}</Badge>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-5 w-5" />
            <span className="font-medium text-sm">{lab.views || 0}</span>
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
      </div>
      
      <div 
        ref={iframeContainerRef}
        className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border"
      >
        <iframe
          title={lab.title}
          srcDoc={lab.htmlCode}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
          allowFullScreen
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
      </div>

      <div className="mt-12 space-y-8 max-w-3xl mx-auto">
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">Tentang Simulasi Ini</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {lab.description || `Jelajahi simulasi interaktif "${lab.title}" yang dibuat oleh ${lab.authorName}. Simulasi ini dirancang untuk mata pelajaran ${lab.subject}. Buka dalam mode layar penuh untuk pengalaman terbaik!`}
            </p>
        </div>
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">Tujuan Pembelajaran</h2>
            <p className="text-foreground/80 leading-relaxed">
                Simulasi lab virtual ini bertujuan untuk memberikan cara yang aman dan interaktif bagi para siswa untuk memahami konsep-konsep dalam <strong>{lab.subject}</strong>. Dengan melakukan eksperimen virtual, siswa dapat menjelajahi sebab-akibat, memvisualisasikan proses yang kompleks, dan belajar melalui penemuan tanpa memerlukan peralatan fisik.
            </p>
        </div>
      </div>

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
            {isLoadingComments && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-3">Memuat komentar...</p>
                </div>
            )}
            {!isLoadingComments && comments && comments.length > 0 ? (
            comments.map(c => (
                <div key={c.id} className="flex items-start gap-4 animate-in fade-in-0 duration-300">
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
            ) : null}
            {!isLoadingComments && (!comments || comments.length === 0) && (
                <div className="text-center text-muted-foreground py-12">
                    <h3 className="font-semibold">Belum ada komentar</h3>
                    <p>Jadilah yang pertama berkomentar di simulasi ini.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
