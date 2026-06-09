const WHATSAPP_PAIRING_QR_PREFIX = "https://wa.me/settings/linked_devices#";

export const isValidWhatsAppQrCode = (value) => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes("linktr.ee")) return false;

  if (trimmed.startsWith(WHATSAPP_PAIRING_QR_PREFIX)) {
    return true;
  }

  if (
    trimmed.includes("http://") ||
    trimmed.includes("https://") ||
    trimmed.startsWith("http")
  ) {
    return false;
  }

  return true;
};

export const sanitizeWhatsAppQrCode = (value) => {
  return isValidWhatsAppQrCode(value) ? value.trim() : "";
};
