'use client';

// ... (import tetap sama, tambahkan rincian di bawah)
import { Info, HelpCircle, Trophy, Lightbulb } from 'lucide-react'; 

export default function GameClient({ id }: { id: string }) {
  // ... (state dan hooks tetap sama)

  // --- LOGIKA TAMBAHAN UNTUK SEO ---
  // Kita buat konten dinamis berdasarkan data yang ada agar Googlebot melihat artikel yang unik
  const seoText = {
    howToPlay: `Untuk memainkan game "${game?.title}", Anda cukup menggunakan mouse atau touchscreen. Ikuti instruksi yang muncul di dalam layar permainan untuk menyelesaikan tantangan mata pelajaran ${game?.subject}.`,
    targetAudience: `Media ini dikembangkan khusus untuk siswa tingkat ${game?.class} dalam memahami materi ${game?.subject} secara interaktif.`,
  };

  if (error) return (/* ... tetap sama ... */);
  if (!isLoading && !game) return (/* ... tetap sama ... */);

  return (
    <>
      {/* 1. BREADCRUMBS (Sangat Bagus untuk SEO Crawling) */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-hidden">
        <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors shrink-0">
          <Home className="h-3.5 w-3.5" /> Beranda
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/?level=${game?.class}`} className="hover:text-primary transition-colors shrink-0">
          {game?.class || "Level"}
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-foreground font-medium truncate">{game?.title}</span>
      </nav>

      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-headline text-slate-900">
            {isLoading ? <Skeleton className="h-10 w-64" /> : game?.title}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground mt-3">
             <Avatar className="h-6 w-6">
                <AvatarImage src={''} />
                <AvatarFallback className="text-[10px]">GK</AvatarFallback>
             </Avatar>
             <span className="text-sm">
                Oleh <Link href={`/user/${game?.userId}`} className="font-semibold text-primary hover:underline">{game?.authorName}</Link>
             </span>
             <span className="text-slate-300">|</span>
             <span className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" /> {game?.views} tayangan</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" /> Bagikan
           </Button>
           {/* Popover Report tetap sama */}
        </div>
      </div>

      {/* 2. AD SLOT: TOP (Penting untuk revenue) */}
      <div className="w-full min-h-[90px] bg-muted/20 border border-dashed mb-6 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest">
         Iklan Atas Game
      </div>

      {/* 3. GAME AREA (Main Interaction) */}
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div 
            ref={iframeContainerRef}
            className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] border-4 border-white"
          >
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium animate-pulse">Menyiapkan Media Pembelajaran...</p>
              </div>
            ) : (
              <>
                <iframe
                  title={game?.title}
                  srcDoc={game?.htmlCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
                  allowFullScreen
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleFullscreen} 
                  className="absolute bottom-4 right-4 opacity-70 hover:opacity-100 transition-opacity"
                >
                  {isFullscreen ? <Shrink className="mr-2 h-4 w-4" /> : <Expand className="mr-2 h-4 w-4" />}
                  {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                </Button>
              </>
            )}
          </div>

          {/* 4. CONTENT ENRICHMENT (Agar tidak dianggap Low Value oleh AdSense) */}
          <div className="grid md:grid-cols-2 gap-6">
             <section className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                   <HelpCircle className="w-5 h-5 text-primary" /> Cara Bermain
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                   {seoText.howToPlay} Permainan ini tidak memerlukan unduhan, dapat langsung dimainkan melalui browser di smartphone maupun PC.
                </p>
             </section>
             
             <section className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                   <Lightbulb className="w-5 h-5 text-orange-500" /> Manfaat Materi
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                   Memahami <strong>{game?.subject}</strong> untuk <strong>{game?.class}</strong> menjadi lebih mudah dengan visualisasi interaktif. Membantu meningkatkan fokus dan daya ingat siswa.
                </p>
             </section>
          </div>

          {/* 5. DESCRIPTION & COMMENTS */}
          <div className="space-y-8">
            <article className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold font-headline">Deskripsi Lengkap</h2>
              <div className="p-6 bg-slate-50 rounded-xl border-l-4 border-primary">
                <p className="whitespace-pre-wrap text-slate-700 italic">
                   {game?.description || "Belum ada deskripsi tambahan untuk media ini."}
                </p>
              </div>
            </article>

            {/* AD SLOT: IN-CONTENT */}
            <div className="w-full min-h-[250px] bg-muted/10 border border-dashed flex items-center justify-center text-xs text-muted-foreground uppercase">
               Iklan Tengah Artikel
            </div>

            {/* Comments Section tetap sama */}
          </div>
        </div>

        {/* 6. SIDEBAR (Optimasi Internal Link untuk Crawler) */}
        <aside className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-md flex items-center gap-2"><Info className="w-4 h-4" /> Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <p className="text-xs text-muted-foreground">Mata Pelajaran</p>
                  <Badge className="mt-1">{game?.subject}</Badge>
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Kurikulum</p>
                  <p className="text-sm font-medium">Kurikulum Merdeka</p>
               </div>
               <Separator />
               <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm" className="justify-start text-xs" asChild>
                     <Link href={`/subject/${game?.subject}`}><BookOpen className="w-3 h-3 mr-2" /> Lihat Mapel Sejenis</Link>
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* AD SLOT: SIDEBAR */}
          <div className="w-full min-h-[400px] bg-muted/20 border border-dashed flex items-center justify-center text-xs text-muted-foreground text-center p-4">
             Iklan Sidebar<br/>(Sticky Ad)
          </div>

          {/* Rekomendasi Serupa tetap sama */}
        </aside>
      </div>

      {/* 7. BOTTOM SECTION (Popular Games) */}
      <div className="mt-20">
         {/* Popular games section tetap sama */}
      </div>
    </>
  );
}
