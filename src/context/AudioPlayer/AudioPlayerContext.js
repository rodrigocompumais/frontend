import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const [currentPlayingMessageId, setCurrentPlayingMessageId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    setCurrentTime(0);
    setDuration(0);
    audio
      .play()
      .then(() => {
        setCurrentPlayingMessageId(next.messageId);
        setIsPlaying(true);
      })
      .catch((err) => console.warn("Erro ao reproduzir próximo áudio:", err));
  }, []);

  const playAudio = useCallback(
    (url, messageId, nextInQueue = []) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (playingIdRef.current === messageId && !audio.paused) {
        audio.pause();
        playingIdRef.current = null;
        queueRef.current = [];
        setCurrentPlayingMessageId(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return;
      }

      queueRef.current = Array.isArray(nextInQueue) ? [...nextInQueue] : [];
      playingIdRef.current = messageId;
      audio.src = url;
      setCurrentTime(0);
      setDuration(0);
      audio
        .play()
        .then(() => {
          setCurrentPlayingMessageId(messageId);
          setIsPlaying(true);
        })
        .catch((err) => console.warn("Erro ao reproduzir áudio:", err));
    },
    []
  );

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    queueRef.current = [];
    playingIdRef.current = null;
    setCurrentPlayingMessageId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seekAudio = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const r = Math.min(1, Math.max(0, ratio));
    audio.currentTime = r * audio.duration;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      if (playingIdRef.current) {
        setCurrentTime(audio.currentTime || 0);
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
      }
    };

    const handleEnded = () => {
      if (queueRef.current.length > 0) {
        playNextInQueue();
      } else {
        playingIdRef.current = null;
        setCurrentPlayingMessageId(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
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
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncTime);
    audio.addEventListener("durationchange", syncTime);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncTime);
      audio.removeEventListener("durationchange", syncTime);
    };
  }, [playNextInQueue]);

  const value = {
    playAudio,
    stopAudio,
    seekAudio,
    currentPlayingMessageId,
    isPlaying,
    currentTime,
    duration,
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
};
