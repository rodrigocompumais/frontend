import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

/**
 * Cache local para traduções
 * Estrutura: { "hash-pt-en": { translation: "...", timestamp: ... } }
 */
const CACHE_KEY = "messageTranslationsCache";
const CACHE_DURATION = 86400000; // 24 horas em ms

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
 * Hook para tradução de mensagens
 */
const useMessageTranslation = (message, companyLanguage, enabled = true) => {
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translateMessage = useCallback(async () => {
    // Validações
    if (!enabled || !message || !message.body || !companyLanguage) {
      return;
    }

    const text = message.body.trim();
    
    // Não traduzir textos muito curtos
    if (text.length < 10) {
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
        console.log("Tradução encontrada em cache local:", cacheKey);
        setTranslation({
          translatedText: cachedTranslation.translation,
          sourceLanguage: cachedTranslation.sourceLanguage,
          targetLanguage: companyLanguage,
          cached: true
        });
        setLoading(false);
        return;
      }

      // Chamar API de tradução
      const { data } = await api.post(`/translation/message/${message.id}`, {
        targetLanguage: companyLanguage
      });

      // Se não precisar traduzir, não armazenar nem exibir
      if (!data.translationNeeded || data.sourceLanguage === data.targetLanguage) {
        setTranslation(null);
        setLoading(false);
        return;
      }

      // Armazenar em cache local
      cache[cacheKey] = {
        translation: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        timestamp: Date.now()
      };
      setCache(cache);

      // Limpar cache expirado periodicamente
      if (Object.keys(cache).length > 100) {
        cleanExpiredCache();
      }

      setTranslation({
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        cached: data.cached || false
      });

    } catch (err) {
      console.error("Erro ao traduzir mensagem:", err);
      setError(err.response?.data?.error || "Erro ao traduzir mensagem");
      // Não mostrar toast para não poluir a UI
    } finally {
      setLoading(false);
    }
  }, [message, companyLanguage, enabled]);

  useEffect(() => {
    translateMessage();
  }, [translateMessage]);

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
