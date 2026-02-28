import { Metadata } from "next";
import GameClient from "./GameClient";

interface Game {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  class?: string;
  authorName?: string;
  createdAt?: string;
  htmlCode?: string;
}

async function getGameData(id: string): Promise<Game | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/game/${id}`,
      {
        next: { revalidate: 3600 }, // ISR 1 jam
      }
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await getGameData(params.id);

  if (!data) {
    return {
      title: "Game Tidak Ditemukan | MainQ",
      description: "Game tidak tersedia atau telah dihapus.",
    };
  }

  const url = `https://mainq.my.id/game/${params.id}`;

  return {
    title: `${data.title} | Game Edukasi Interaktif`,
    description:
      data.description ||
      `Mainkan game edukasi ${data.title} untuk meningkatkan pemahaman siswa secara interaktif.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url,
      siteName: "MainQ",
      type: "article",
    },
  };
}

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const data = await getGameData(params.id);

  if (!data) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Game Tidak Ditemukan</h1>
        <p className="text-muted-foreground mt-4">
          Game mungkin telah dihapus atau belum tersedia.
        </p>
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: "https://mainq.my.id",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Game",
        item: "https://mainq.my.id/game",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.title,
        item: `https://mainq.my.id/game/${params.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="container mx-auto px-4 py-10">
        {/* HEADER SEO FRIENDLY */}
        <header className="max-w-4xl mx-auto mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            {data.title}
          </h1>

          {data.description && (
            <p className="text-muted-foreground leading-relaxed">
              {data.description}
            </p>
          )}

          <div className="text-sm text-muted-foreground">
            Mata Pelajaran: {data.subject || "-"} · Level:{" "}
            {data.class || "-"} · Oleh {data.authorName || "Guru"}
          </div>
        </header>

        <GameClient id={params.id} initialGame={data} />
      </div>
    </>
  );
}
