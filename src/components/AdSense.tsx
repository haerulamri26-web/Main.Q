'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

// Routes where ads should NOT be displayed to avoid "no content" violations.
const AD_FREE_ROUTES = [
  '/login',
  '/register',
  '/upload',
  '/profile',
  '/admin',
  '/edit', // Matches /edit/[id]
  '/user',  // Matches /user/[userId]
];

export function AdSense() {
  const pathname = usePathname();

  // Check if the current route starts with any of the ad-free prefixes
  const isAdFreeRoute = AD_FREE_ROUTES.some(route => pathname.startsWith(route));

  // Don't render ads on ad-free routes or in development environment
  if (isAdFreeRoute || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-script"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8378725062743955"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
