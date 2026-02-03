import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://mainq.netlify.app';
 
  const routes = [
    '', // Homepage
    '/popular',
    '/about',
    '/contact',
    '/privacy',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));
 
  // Catatan: Sitemap ini saat ini hanya mencakup halaman-halaman utama (statis).
  // Agar Google dapat mengindeks setiap halaman game secara individual, file ini
  // perlu mengambil daftar semua game dari database dan menambahkannya ke daftar rute.
  // Ini adalah langkah optimasi SEO lanjutan.
 
  return routes;
}
