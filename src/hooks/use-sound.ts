'use client';

import { useCallback, useEffect, useState } from 'react';

// Using URLs from a reliable source like Pixabay which allows free use.
const CLICK_SOUND_URL = 'https://pixabay.com/sound-effects/uploads/audio/2022/03/10/audio_c848a6379c.mp3';
const START_GAME_SOUND_URL = 'https://pixabay.com/sound-effects/uploads/audio/2022/05/27/audio_39c71c1b48.mp3';

type AudioMap = {
  click?: HTMLAudioElement;
  start?: HTMLAudioElement;
}

export function useSound() {
  const [audio, setAudio] = useState<AudioMap>({});

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    const clickAudio = new Audio(CLICK_SOUND_URL);
    clickAudio.volume = 0.4; // Lower volume for UI clicks
    
    const startAudio = new Audio(START_GAME_SOUND_URL);
    startAudio.volume = 0.6;
    
    setAudio({
      click: clickAudio,
      start: startAudio,
    });

    // Cleanup function to pause audio elements when component unmounts
    return () => {
        clickAudio.pause();
        startAudio.pause();
    };
  }, []); // Empty dependency array ensures this runs only once

  const playClick = useCallback(() => {
    if (audio.click) {
      audio.click.currentTime = 0;
      audio.click.play().catch(error => {
        // Autoplay errors are common, we can log them but they shouldn't crash the app
        console.warn("Could not play click sound:", error.message);
      });
    }
  }, [audio.click]);

  const playStart = useCallback(() => {
    if (audio.start) {
      audio.start.currentTime = 0;
      audio.start.play().catch(error => {
        console.warn("Could not play start sound:", error.message);
      });
    }
  }, [audio.start]);

  return { playClick, playStart };
}
