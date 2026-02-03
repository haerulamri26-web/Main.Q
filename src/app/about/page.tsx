'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Gamepad2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Tentang MAIN Q</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
          Misi kami adalah merevolusi pendidikan dengan membuatnya lebih interaktif, menarik, dan menyenangkan melalui game.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Gamepad2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4">Platform Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              MAIN Q adalah platform inovatif tempat para guru dapat membuat, berbagi, dan menggunakan game edukasi berbasis HTML sederhana. Kami percaya bahwa belajar melalui permainan dapat meningkatkan retensi dan pemahaman materi secara signifikan.
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <Target className="h-10 w-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">Visi Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Kami bercita-cita untuk menciptakan komunitas global di mana pendidik dan siswa dapat berkolaborasi. Kami ingin menjadikan MAIN Q sebagai sumber utama untuk konten pembelajaran yang kreatif dan efektif bagi semua jenjang pendidikan.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-secondary p-4 rounded-full w-fit">
              <Users className="h-10 w-10 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">Untuk Siapa?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Platform ini didedikasikan untuk para guru yang ingin berinovasi, siswa yang ingin belajar dengan cara yang menyenangkan, dan siapa saja yang percaya pada kekuatan pendidikan yang mentransformasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
