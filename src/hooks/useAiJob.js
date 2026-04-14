/**
 * Hook para iniciar e monitorar jobs de IA em segundo plano.
 *
 * Uso:
 *   const { startJob, cancelJob, jobOpen, progress, phase, status, result, error } = useAiJob();
 *
 *   // Iniciar:
 *   const res = await startJob("campaign_initial", { objective });
 *   if (res) { ... usa res directamente ... }  // resultado já disponível no retorno
 *
 *   // A qualquer momento pode cancelar (abandona polling; job expira no servidor):
 *   cancelJob();
 */

import { useState, useRef, useCallback } from "react";
import api from "../services/api";
import toastError from "../errors/toastError";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 300; // 7.5 min máx de polling

const useAiJob = () => {
  const [jobOpen, setJobOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Iniciando…");
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pollRef = useRef(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const cancelJob = useCallback(() => {
    stopPolling();
    setJobOpen(false);
    setStatus("idle");
    setProgress(0);
    setPhase("Iniciando…");
    setResult(null);
    setError(null);
  }, [stopPolling]);

  /**
   * Inicia o job no servidor e começa o polling.
   * Resolve com o `result` quando o job concluir, ou `null` se cancelado/erro.
   */
  const startJob = useCallback(
    (type, payload) =>
      new Promise((resolve) => {
        // Reset state
        setProgress(5);
        setPhase("Iniciando…");
        setStatus("running");
        setResult(null);
        setError(null);
        setJobOpen(true);
        attemptsRef.current = 0;

        api
          .post("/ai/jobs", { type, payload })
          .then(({ data }) => {
            const { jobId } = data;

            stopPolling();
            pollRef.current = setInterval(async () => {
              attemptsRef.current += 1;

              if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
                stopPolling();
                setStatus("error");
                setError("Tempo máximo de espera atingido. Tente novamente.");
                setJobOpen(false);
                resolve(null);
                return;
              }

              try {
                const { data: jobData } = await api.get(`/ai/jobs/${jobId}`);

                setProgress(jobData.progress ?? 0);
                setPhase(jobData.phase ?? "Processando…");
                setStatus(jobData.status);

                if (jobData.status === "done") {
                  stopPolling();
                  setResult(jobData.result);
                  setJobOpen(false);
                  resolve(jobData.result);
                } else if (jobData.status === "error") {
                  stopPolling();
                  setError(jobData.error ?? "Erro no processamento de IA.");
                  setJobOpen(false);
                  resolve(null);
                }
              } catch (pollErr) {
                // Falha de rede — continua tentando até MAX_POLL_ATTEMPTS
                console.warn("[useAiJob] Erro de polling:", pollErr?.message);
              }
            }, POLL_INTERVAL_MS);
          })
          .catch((err) => {
            toastError(err);
            setStatus("error");
            setError(err?.response?.data?.message ?? err?.message ?? "Erro ao iniciar job.");
            setJobOpen(false);
            resolve(null);
          });
      }),
    [stopPolling]
  );

  return {
    startJob,
    cancelJob,
    jobOpen,
    progress,
    phase,
    status,
    result,
    error,
  };
};

export default useAiJob;
