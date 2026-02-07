import React from "react";
import { Button } from "@material-ui/core";
import { PlayArrow, Pause } from "@material-ui/icons";
import { useAudioPlayer } from "../../context/AudioPlayer/AudioPlayerContext";
import { i18n } from "../../translate/i18n";

/**
 * Player de áudio que usa elemento global único.
 * Não é interrompido quando novas mensagens chegam na conversa.
 * Reproduz automaticamente o próximo áudio da fila quando há sequência.
 */
const AudioMessagePlayer = ({ messageId, mediaUrl, nextAudiosInQueue = [], onTranscribe, transcriptionLoading }) => {
  const { playAudio, stopAudio, currentPlayingMessageId, isPlaying } = useAudioPlayer();
  const isThisPlaying = currentPlayingMessageId === messageId && isPlaying;

  const handleTogglePlay = () => {
    if (isThisPlaying) {
      stopAudio();
    } else {
      playAudio(mediaUrl, messageId, nextAudiosInQueue);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleTogglePlay}
          startIcon={isThisPlaying ? <Pause /> : <PlayArrow />}
        >
          {isThisPlaying ? "Pausar" : "Reproduzir"}
        </Button>
        <span style={{ fontSize: 12, color: "#666" }}>
          {isThisPlaying ? "● Tocando..." : ""}
        </span>
      </div>
      {onTranscribe && (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => onTranscribe(messageId)}
          disabled={transcriptionLoading}
          style={{ marginTop: 4 }}
        >
          {i18n.t("messagesList.audio.transcribe")}
        </Button>
      )}
    </div>
  );
};

export default AudioMessagePlayer;
