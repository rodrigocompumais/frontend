import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

/**
 * Cache local para traduções
 * Estrutura: { "hash-pt-en": { translation: "...", timestamp: ... } }
 */
const CACHE_KEY = "messageTranslationsCache";
const CACHE_DURATION = 86400000; // 24 horas em ms

/**
 * Queue global para batch de traduções
 * Agrupa requisições de tradução para reduzir carga no servidor
 */
const translationQueue = {
  pending: new Map(), // messageId -> { resolve, reject, message, companyLanguage }
  timeout: null,
  BATCH_DELAY: 300, // ms - delay para agrupar requisições
  MAX_BATCH_SIZE: 20
};

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (err) {
    console.error("Erro ao ler cache de traduções:", err);
    return {};
  }
};

const setCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error("Erro ao salvar cache de traduções:", err);
  }
};

const generateCacheKey = (text, sourceLang, targetLang) => {
  // Simples hash para cache (primeiros 50 chars + idiomas)
  const textHash = text.slice(0, 50).replace(/\s/g, '');
  return `${textHash}-${sourceLang || 'auto'}-${targetLang}`;
};

const cleanExpiredCache = () => {
  try {
    const cache = getCache();
    const now = Date.now();
    let modified = false;

    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_DURATION) {
        delete cache[key];
        modified = true;
      }
    });

    if (modified) {
      setCache(cache);
    }
  } catch (err) {
    console.error("Erro ao limpar cache:", err);
  }
};

/**
 * Processa batch de traduções pendentes
 */
const processTranslationBatch = async () => {
  if (translationQueue.pending.size === 0) {
    return;
  }

  const batch = Array.from(translationQueue.pending.entries())
    .slice(0, translationQueue.MAX_BATCH_SIZE)
    .map(([messageId, item]) => ({ messageId, ...item }));

  // Limpar queue
  batch.forEach(({ messageId }) => {
    translationQueue.pending.delete(messageId);
  });

  if (batch.length === 0) {
    return;
  }

  try {
    // Agrupar por companyLanguage para fazer batches separados
    const byLanguage = new Map();
    batch.forEach(({ messageId, message, companyLanguage, resolve, reject }) => {
      if (!byLanguage.has(companyLanguage)) {
        byLanguage.set(companyLanguage, []);
      }
      byLanguage.get(companyLanguage).push({ messageId, message, resolve, reject });
    });

    // Processar cada grupo de idioma
    const batchPromises = Array.from(byLanguage.entries()).map(async ([companyLanguage, items]) => {
      const messageIds = items.map(item => item.messageId);
      
      try {
        const { data } = await api.post("/translation/messages/batch", {
          messageIds,
          targetLanguage: companyLanguage
        });

        // Processar resultados
        items.forEach(({ messageId, message, resolve, reject }) => {
          const result = data.translations?.find(t => t.messageId === messageId);
          if (result && !result.error) {
            // Armazenar em cache local
            const cache = getCache();
            const cacheKey = generateCacheKey(message.body, result.sourceLanguage, companyLanguage);
            cache[cacheKey] = {
              translation: result.translatedText,
              sourceLanguage: result.sourceLanguage,
              timestamp: Date.now()
            };
            setCache(cache);

            resolve(result);
          } else {
            reject(new Error(result?.error || "Erro ao traduzir"));
          }
        });
      } catch (err) {
        // Rejeitar todas as promessas do batch
        items.forEach(({ reject }) => {
          reject(err);
        });
      }
    });

    await Promise.all(batchPromises);
  } catch (err) {
    console.error("Erro ao processar batch de traduções:", err);
  }
};

/**
 * Agenda processamento de batch com debounce
 */
const scheduleBatchProcessing = () => {
  if (translationQueue.timeout) {
    clearTimeout(translationQueue.timeout);
  }

  translationQueue.timeout = setTimeout(() => {
    processTranslationBatch();
    translationQueue.timeout = null;
  }, translationQueue.BATCH_DELAY);
};

/**
 * Hook para tradução de mensagens (otimizado com batch e debounce)
 */
const useMessageTranslation = (message, companyLanguage, enabled = true) => {
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const translateMessage = useCallback(async () => {
    // Validações
    if (!enabled || !message || !message.body || !companyLanguage) {
      return;
    }

    const text = message.body.trim();
    
    // Não traduzir textos muito curtos (reduzido para 5 caracteres)
    if (text.length < 5) {
      return;
    }

    // Não traduzir se for apenas números ou emojis
    const textWithoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    const onlyNumbersOrSpecial = /^[0-9\s\W]+$/.test(textWithoutEmojis);
    if (onlyNumbersOrSpecial) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar cache local primeiro
      const cache = getCache();
      const cacheKey = generateCacheKey(text, null, companyLanguage);
      const cachedTranslation = cache[cacheKey];

      if (cachedTranslation && (Date.now() - cachedTranslation.timestamp) < CACHE_DURATION) {
        if (isMountedRef.current) {
          setTranslation({
            translatedText: cachedTranslation.translation,
            sourceLanguage: cachedTranslation.sourceLanguage,
            targetLanguage: companyLanguage,
            cached: true
          });
          setLoading(false);
        }
        return;
      }

      // Tentar usar batch primeiro, mas ter fallback para endpoint individual
      let result;
      try {
        // Usar batch para tradução
        const translationPromise = new Promise((resolve, reject) => {
          translationQueue.pending.set(message.id, {
            resolve,
            reject,
            message,
            companyLanguage
          });
          scheduleBatchProcessing();
        });

        // Timeout para batch (5 segundos)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 5000);
        });

        result = await Promise.race([translationPromise, timeoutPromise]);
      } catch (batchError) {
        // Fallback: usar endpoint individual se batch falhar
        console.log("Batch falhou, usando endpoint individual:", batchError);
        try {
          const { data } = await api.post(`/translation/message/${message.id}`, {
            targetLanguage: companyLanguage
          });
          result = data;
        } catch (individualError) {
          throw individualError;
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      // Se não precisar traduzir, não armazenar nem exibir
      if (!result.translationNeeded || result.sourceLanguage === result.targetLanguage) {
        setTranslation(null);
        setLoading(false);
        return;
      }

      setTranslation({
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        cached: result.cached || false
      });

      // Limpar cache expirado periodicamente
      const cacheAfter = getCache();
      if (Object.keys(cacheAfter).length > 100) {
        cleanExpiredCache();
      }

    } catch (err) {
      if (isMountedRef.current) {
        console.error("Erro ao traduzir mensagem:", err);
        setError(err.response?.data?.error || err.message || "Erro ao traduzir mensagem");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [message, companyLanguage, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Limpar tradução quando desabilitado
      setTranslation(null);
      setLoading(false);
      setError(null);
      return;
    }
    translateMessage();
  }, [translateMessage, enabled]);

  const retryTranslation = useCallback(() => {
    setError(null);
    translateMessage();
  }, [translateMessage]);

  return {
    translation,
    loading,
    error,
    retryTranslation
  };
};

export default useMessageTranslation;
