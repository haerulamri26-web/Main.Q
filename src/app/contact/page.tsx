'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Hubungi Kami</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
          Kami senang mendengar dari Anda. Jika Anda memiliki pertanyaan, masukan, atau butuh bantuan, jangan ragu untuk menghubungi kami melalui email.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4 text-xl">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Untuk pertanyaan, masukan, atau permintaan dukungan, email adalah cara terbaik untuk menghubungi kami. Tim kami akan merespons pesan Anda sesegera mungkin.
            </p>
            <a href="mailto:haerulamri26@gmail.com" className="text-primary font-semibold hover:underline mt-2 inline-block">
              haerulamri26@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
