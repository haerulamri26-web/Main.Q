'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

/**
 * A safe React wrapper for AdSense ad units.
 * Prevents "All 'ins' elements already have ads" errors.
 */
export function AdUnit({ 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  className = '',
  style = { display: 'block' }
}: { 
  slot: string, 
  format?: string, 
  responsive?: string, 
  className?: string,
  style?: React.CSSProperties
}) {
  const pathname = usePathname();
  const isAdFreeRoute = AD_FREE_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Only push if in production and not on an ad-free route
    if (typeof window !== 'undefined' && (window as any).adsbygoogle && process.env.NODE_ENV === 'production' && !isAdFreeRoute) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [pathname, isAdFreeRoute]);

  if (isAdFreeRoute || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-8378725062743955"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
