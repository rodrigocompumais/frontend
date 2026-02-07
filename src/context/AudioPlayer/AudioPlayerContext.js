import React, { createContext, useContext, useRef, useState, useCallback } from "react";

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const [currentPlayingMessageId, setCurrentPlayingMessageId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playingIdRef = useRef(null);

  const queueRef = useRef([]);

  const playNextInQueue = useCallback(() => {
    const queue = queueRef.current;
    if (queue.length === 0) return;

    const next = queue.shift();
    const audio = audioRef.current;
    if (!audio) return;

    playingIdRef.current = next.messageId;
    audio.src = next.url;
    audio.play()
      .then(() => {
        setCurrentPlayingMessageId(next.messageId);
        setIsPlaying(true);
      })
      .catch((err) => console.warn("Erro ao reproduzir próximo áudio:", err));
  }, []);

  const playAudio = useCallback((url, messageId, nextInQueue = []) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Se já está tocando este áudio, pausar
    if (playingIdRef.current === messageId && !audio.paused) {
      audio.pause();
      playingIdRef.current = null;
      queueRef.current = [];
      setCurrentPlayingMessageId(null);
      setIsPlaying(false);
      return;
    }

    queueRef.current = Array.isArray(nextInQueue) ? [...nextInQueue] : [];
    playingIdRef.current = messageId;
    audio.src = url;
    audio.play()
      .then(() => {
        setCurrentPlayingMessageId(messageId);
        setIsPlaying(true);
      })
      .catch((err) => console.warn("Erro ao reproduzir áudio:", err));
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    queueRef.current = [];
    playingIdRef.current = null;
    setCurrentPlayingMessageId(null);
    setIsPlaying(false);
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (queueRef.current.length > 0) {
        playNextInQueue();
      } else {
        playingIdRef.current = null;
        setCurrentPlayingMessageId(null);
        setIsPlaying(false);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [playNextInQueue]);

  const value = {
    playAudio,
    stopAudio,
    currentPlayingMessageId,
    isPlaying,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
};
