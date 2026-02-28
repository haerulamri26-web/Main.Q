"use client";

import { useEffect, useState } from "react";

interface Game {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  class?: string;
  authorName?: string;
  htmlCode?: string;
}

export default function GameClient({
  id,
  initialGame,
}: {
  id: string;
  initialGame: Game;
}) {
  const [game] = useState<Game>(initialGame);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Increment view optional (bisa pakai API route)
    fetch(`/api/game/${id}/view`, { method: "POST" }).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* GAME CONTAINER */}
      <div className="relative border rounded-xl overflow-hidden shadow-lg">
        <iframe
          srcDoc={game.htmlCode}
          title={game.title}
          className="w-full h-[600px]"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* KONTEN EDUKASI TAMBAHAN (SEO BOOSTER) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Tentang Game {game.title}
        </h2>

        <p>
          Game edukasi ini dirancang untuk membantu siswa memahami materi{" "}
          {game.subject || "pelajaran"} dengan cara yang interaktif dan
          menyenangkan. Melalui pendekatan visual dan praktik langsung,
          siswa dapat meningkatkan pemahaman konsep secara lebih efektif.
        </p>

        <p>
          Guru dapat menggunakan game ini sebagai media pembelajaran
          digital di kelas maupun pembelajaran mandiri di rumah. Interaksi
          langsung membuat siswa lebih aktif dan terlibat dalam proses
          belajar.
        </p>
      </section>
    </div>
  );
}
