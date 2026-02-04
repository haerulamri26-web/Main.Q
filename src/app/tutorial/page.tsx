'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode, UploadCloud, CheckCircle, Bot, Youtube } from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Cara Membuat Game Interaktif dengan Bantuan AI</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Tidak bisa coding? Tidak masalah! Ikuti panduan ini untuk membuat game HTML sederhana menggunakan kekuatan AI seperti ChatGPT atau Gemini, lalu unggah ke MAIN Q secara gratis.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-red-500/10 p-3 rounded-full">
                        <Youtube className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                        <CardTitle className="font-headline text-2xl">Tonton Video Tutorialnya</CardTitle>
                        <CardDescription>Lihat langkah-langkahnya dalam format video agar lebih mudah diikuti.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="aspect-video overflow-hidden rounded-lg border">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/BzQ5uCInfG8?si=percAdflzh3APay2"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                    <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <CardDescription>Langkah 1</CardDescription>
                    <CardTitle className="font-headline text-2xl">Minta AI Membuat Game</CardTitle>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Anda tidak perlu menjadi seorang programmer. Cukup jelaskan ide game Anda kepada AI generatif, dan ia akan menuliskan kodenya untuk Anda.
            </p>
            <p className="font-semibold">Platform AI Gratis:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ChatGPT</a></li>
              <li><a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Gemini</a></li>
              <li><a href="https://copilot.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Copilot</a></li>
            </ul>
            <p className="mt-4 text-muted-foreground">Semakin detail permintaan Anda (prompt), semakin bagus hasilnya.</p>
          </CardContent>
        </Card>
        
        {/* Step 2 */}
        <Card className="lg:col-span-2">
          <CardHeader>
             <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-accent/20 p-3 rounded-full">
                    <FileCode className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                    <CardDescription>Langkah 2</CardDescription>
                    <CardTitle className="font-headline text-2xl">Salin & Tempel Prompt Ini</CardTitle>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Untuk memulai, coba salin contoh prompt di bawah ini dan tempelkan ke platform AI pilihan Anda.
            </p>

            <div>
                <h3 className="font-semibold text-lg mb-2">Prompt untuk AI (ChatGPT, Gemini, dll.)</h3>
                <div className="bg-muted/50 p-4 rounded-md border text-sm text-foreground/80 font-mono whitespace-pre-wrap">
                    {'buatkan saya website interaktif dengan tema [masukkan tema sesuai kebutuhan] dengan isi materi [isi dengan materi yang diinginkan atau bisa memasukkan tujuan pembejlajaran]\n\nTambahkan ketentuan:\n- Gunakan HTML, CSS, dan JavaScript\n- Semua kode harus dalam satu file'}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg mb-2">Prompt untuk Canva</h3>
                <div className="bg-muted/50 p-4 rounded-md border text-sm text-foreground/80 font-mono whitespace-pre-wrap">
                    {'buatkan saya website interaktif dengan tema [masukkan tema sesuai kebutuhan] dengan isi materi [isi dengan materi yang diinginkan atau bisa memasukkan tujuan pembejlajaran]'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    <strong>Catatan:</strong> Prompt ini untuk membuat desain di Canva. Platform MAIN Q memerlukan unggahan kode HTML. Anda mungkin perlu menggunakan prompt untuk AI di atas untuk mendapatkan hasil yang bisa langsung diunggah.
                </p>
            </div>

            <p className="mt-4 text-muted-foreground">
              {'Setelah AI memberikan kodenya, klik tombol "Salin" atau pilih semua teks kode (`<!DOCTYPE html>...</html>`) dan salin ke clipboard Anda.'}
            </p>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-green-500/10 p-3 rounded-full">
                    <UploadCloud className="h-8 w-8 text-green-600" />
                </div>
                <div>
                    <CardDescription>Langkah 3</CardDescription>
                    <CardTitle className="font-headline text-2xl">Unggah ke MAIN Q</CardTitle>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Masuk ke akun MAIN Q Anda dan buka halaman "Unggah Game". Isi detail game seperti judul dan deskripsi. Terakhir, **tempelkan seluruh kode HTML** yang sudah Anda salin dari AI ke dalam kolom kode yang tersedia. Klik unggah, dan game buatan AI Anda pun siap dimainkan oleh semua orang!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <Button asChild size="lg" className="shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700">
            <Link href="/upload">
                <CheckCircle className="mr-2 h-5 w-5" />
                Saya Mengerti, Ayo Unggah Game!
            </Link>
        </Button>
      </div>
    </div>
  );
}
