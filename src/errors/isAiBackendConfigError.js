const AI_BACKEND_CONFIG_ERRORS = [
  "GEMINI_KEY_MISSING",
  "AI_NOT_CONFIGURED",
  "AI_KEY_MISSING",
];

export default function isAiBackendConfigError(err) {
  const code = err?.response?.data?.error;
  return err?.response?.status === 400 && AI_BACKEND_CONFIG_ERRORS.includes(code);
}
