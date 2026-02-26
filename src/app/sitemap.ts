import { MetadataRoute } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://mainq.my.id';
 
  const routes = [
    '', // Homepage
    '/popular',
    '/tutorial',
    '/lab',
    '/lab/upload',
    '/about',
    '/contact',
    '/help',
    '/privacy',
    '/login',
    '/register',
    '/upload',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : (route === '/lab' || route === '/popular' ? 0.9 : 0.8),
  }));

  // Fetch dynamic game routes for SEO
  let gameRoutes: any[] = [];
  let labRoutes: any[] = [];

  try {
    // Initialize Firebase for server-side fetching in sitemap
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    const gamesSnapshot = await getDocs(collection(db, 'publishedGames'));
    gameRoutes = gamesSnapshot.docs.map(doc => ({
      url: `${siteUrl}/game/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const labsSnapshot = await getDocs(collection(db, 'publishedLabs'));
    labRoutes = labsSnapshot.docs.map(doc => ({
      url: `${siteUrl}/lab/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }
 
  return [...routes, ...gameRoutes, ...labRoutes];
}
