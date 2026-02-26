'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Wrench, MessageCircle, AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HelpCenterPage() {
  const { toast } = useToast();

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Prompt Disalin!",
      description: `${title} telah disalin ke clipboard.`,
    });
  };

  const promptPerbaikan = `Perbaiki kode game ini agar bisa berjalan dengan baik di website mainq.my.id.

Ketentuan WAJIB:
1. Hapus dan JANGAN sertakan script berikut:
   <script src="/_sdk/element_sdk.js"></script>
   <script src="/_sdk/data_sdk.js" type="text/javascript"></script>

2. Jangan gunakan SDK internal, sistem database otomatis, atau script bawaan platform seperti Canva.

3. Gunakan hanya:
   - HTML
   - CSS
   - JavaScript murni
   - CDN publik (contoh: Tailwind atau Google Fonts jika diperlukan)

4. Jika menggunakan sistem skor, simpan menggunakan localStorage (bukan database online).

5. Pastikan game:
   - Responsif dan mobile friendly
   - Tidak error di Console browser
   - Bisa berjalan di dalam iframe
   - Tidak membutuhkan backend/server

6. Berikan hasil akhir dalam 1 file HTML lengkap siap upload.

Tampilkan FULL CODE tanpa penjelasan tambahan.`;

  const promptSkor = `Perbaiki sistem skor game ini agar menggunakan localStorage untuk menyimpan nilai.

Jangan gunakan database online seperti Firebase, Supabase, atau SDK platform lainnya.

Pastikan:
- Nilai tersimpan di browser
- Tidak hilang saat refresh
- Tidak membutuhkan server/backend
- Ringan dan cocok untuk hosting statis
- Bisa berjalan dalam iframe

Output harus berupa 1 file HTML lengkap siap upload.

Tampilkan FULL CODE saja tanpa penjelasan.`;

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">🔧 Pusat Bantuan</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Cara Mengatasi Game Tidak Tampil atau Error di MAIN Q. Ikuti panduan di bawah ini untuk memastikan game Anda berjalan sempurna.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-headline">
              <AlertTriangle className="h-6 w-6" />
              Kenapa Game Tidak Tampil?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base leading-relaxed text-orange-900 dark:text-orange-200">
              Jika game atau kuis yang dibuat di <strong>Canva</strong> atau <strong>AI generator</strong> tidak tampil dengan baik, biasanya penyebabnya adalah penggunaan script bawaan platform yang tidak kompatibel dengan hosting statis atau iframe (sandbox).
            </p>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Solusi: Gunakan Prompt Perbaikan
          </h2>
          <Accordion type="single" collapsible className="w-full bg-card border rounded-lg overflow-hidden">
            <AccordionItem value="prompt-lanjutan" className="px-4">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                ✅ PROMPT LANJUTAN PERBAIKAN GAME
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <p className="mb-4 text-muted-foreground">Copy prompt di bawah ini dan berikan ke ChatGPT/Gemini beserta kode game Anda yang error:</p>
                <div className="relative group">
                  <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono border">
                    {promptPerbaikan}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(promptPerbaikan, "Prompt Perbaikan Game")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="prompt-skor" className="px-4">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                ✅ PROMPT PERBAIKAN SISTEM SKOR
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <p className="mb-4 text-muted-foreground">Jika skor kuis tidak tersimpan atau error, gunakan prompt ini:</p>
                <div className="relative group">
                  <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono border">
                    {promptSkor}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(promptSkor, "Prompt Perbaikan Skor")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Sistem Skor Lokal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Menggunakan database otomatis dari AI seperti Canva dapat menyebabkan error. Gunakan <strong>localStorage</strong> (penyimpanan browser) agar nilai tersimpan sementara tanpa membutuhkan server/backend.
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
                <Phone className="h-5 w-5" />
                Butuh Bantuan Langsung?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 text-muted-foreground">Jika masih mengalami kendala teknis atau error game, hubungi tim support kami:</p>
              <Button asChild className="w-full">
                <a href="https://wa.me/6285240159537" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp: 085240159537
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
