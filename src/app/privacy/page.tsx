'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Kebijakan Privasi</CardTitle>
          <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">1. Pendahuluan</h2>
            <p>
              Selamat datang di MAIN Q. Kami menghargai privasi Anda dan berkomitmen untuk melindunginya. Kebijakan Privasi ini menjelaskan jenis informasi yang kami kumpulkan dari Anda atau yang Anda berikan saat mengunjungi situs web kami, serta praktik kami dalam mengumpulkan, menggunakan, menjaga, melindungi, dan mengungkapkan informasi tersebut.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">2. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan beberapa jenis informasi dari dan tentang pengguna Situs kami, termasuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                <strong>Informasi Pribadi:</strong> Saat Anda mendaftar, kami mengumpulkan informasi seperti nama, alamat email, dan kredensial login (kata sandi disimpan dalam bentuk hash).
              </li>
              <li>
                <strong>Konten Buatan Pengguna:</strong> Kami menyimpan game (kode HTML) dan komentar yang Anda unggah ke platform kami.
              </li>
              <li>
                <strong>Informasi Penggunaan:</strong> Detail kunjungan Anda ke Situs kami, termasuk data lalu lintas, data lokasi, log, dan data komunikasi lainnya serta sumber daya yang Anda akses dan gunakan di Situs.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">3. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>
              Kami menggunakan informasi yang kami kumpulkan tentang Anda atau yang Anda berikan kepada kami untuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Menyajikan Situs kami dan isinya kepada Anda.</li>
              <li>Memberi Anda informasi, produk, atau layanan yang Anda minta dari kami.</li>
              <li>Memenuhi tujuan lain yang Anda berikan.</li>
              <li>Mengelola akun Anda dan mempersonalisasi pengalaman Anda.</li>
              <li>Memantau dan menganalisis penggunaan dan tren untuk meningkatkan Situs kami.</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">4. Pengungkapan Informasi Anda</h2>
            <p>
              Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami dapat mengungkapkan informasi pribadi yang kami kumpulkan atau yang Anda berikan:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Kepada penyedia layanan pihak ketiga yang kami gunakan untuk mendukung bisnis kami (misalnya, penyedia hosting).</li>
              <li>Untuk mematuhi perintah pengadilan, hukum, atau proses hukum, termasuk untuk menanggapi permintaan pemerintah atau peraturan.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">5. Keamanan Data</h2>
            <p>
              Kami telah menerapkan langkah-langkah yang dirancang untuk mengamankan informasi pribadi Anda dari kehilangan yang tidak disengaja dan dari akses, penggunaan, pengubahan, dan pengungkapan yang tidak sah. Keamanan dan keselamatan informasi Anda juga bergantung pada Anda.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">6. Perubahan pada Kebijakan Privasi Kami</h2>
            <p>
              Merupakan kebijakan kami untuk memposting setiap perubahan yang kami buat pada kebijakan privasi kami di halaman ini. Tanggal kebijakan privasi terakhir direvisi diidentifikasi di bagian atas halaman.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">7. Informasi Kontak</h2>
            <p>
              Untuk mengajukan pertanyaan atau memberikan komentar tentang kebijakan privasi ini dan praktik privasi kami, silakan hubungi kami di: <a href="mailto:haerulamri26@gmail.com" className="text-primary hover:underline">haerulamri26@gmail.com</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
