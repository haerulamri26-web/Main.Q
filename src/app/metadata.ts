import { Metadata } from 'next';

export const SITE_URL = 'https://mainq.my.id';
export const SITE_NAME = 'MAIN Q';
export const SITE_DESCRIPTION = 'Platform game edukasi interaktif untuk guru dan siswa Indonesia. Mainkan kuis, simulasi, dan media pembelajaran HTML5 sesuai Kurikulum Merdeka. Gratis, tanpa install.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Game Edukasi Interaktif untuk Guru & Siswa Indonesia`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'game edukasi',
    'media pembelajaran',
    'kurikulum merdeka',
    'guru indonesia',
    'siswa sd',
    'siswa smp',
    'siswa sma',
    'html5 game',
    'belajar interaktif',
    'gamifikasi pendidikan',
    'mainq'
  ].join(', '),
  authors: [{ name: 'MAIN Q Team', url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    title: `${SITE_NAME} - Game Edukasi Interaktif`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Platform Game Edukasi Indonesia`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Game Edukasi Interaktif`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/logo.png`],
    creator: '@mainq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'hNuCsI-8kIhGijjApCawbZ3MF1_5DN2XxvPL6jZ_rQ8',
  },
};
