'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Pin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Hubungi Kami</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
          Kami senang mendengar dari Anda. Jika Anda memiliki pertanyaan, masukan, atau butuh bantuan, jangan ragu untuk menghubungi kami.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4 text-xl">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cara terbaik untuk menghubungi kami. Kami akan membalas sesegera mungkin.
            </p>
            <a href="mailto:haerulamri26@gmail.com" className="text-primary font-semibold hover:underline mt-2 inline-block">
              haerulamri26@gmail.com
            </a>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4 text-xl">Telepon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Untuk pertanyaan mendesak, Anda dapat menghubungi kami melalui telepon.
            </p>
            <p className="font-semibold mt-2 text-foreground/90">
              (Nomor telepon akan ditambahkan)
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Pin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4 text-xl">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Kantor pusat kami berlokasi di (kota/negara).
            </p>
            <p className="font-semibold mt-2 text-foreground/90">
              (Alamat lengkap akan ditambahkan)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
