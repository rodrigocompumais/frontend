/**
 * Credenciais "lembradas" no localStorage com AES-GCM (chave derivada por PBKDF2).
 * Não é segurança de nível servidor: qualquer script na origem pode ler após desencriptar.
 */

const STORAGE_KEY = "compuchat_remembered_logins_v1";
const SALT_KEY = "compuchat_remembered_ls_salt_v1";

/** Frase fixa da aplicação + salt único por browser para derivar a chave. */
const PBKDF2_PASSPHRASE = "CompuchatLoginRememberStore-v1";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getOrCreateSalt() {
  let stored = localStorage.getItem(SALT_KEY);
  if (!stored) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    stored = arrayBufferToBase64(bytes.buffer);
    localStorage.setItem(SALT_KEY, stored);
  }
  return base64ToUint8Array(stored);
}

let cachedAesKeyPromise = null;

async function getAesKey() {
  if (!crypto?.subtle) {
    throw new Error("CRYPTO_UNAVAILABLE");
  }
  if (!cachedAesKeyPromise) {
    const salt = getOrCreateSalt();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(PBKDF2_PASSPHRASE),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    cachedAesKeyPromise = crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 120000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  return cachedAesKeyPromise;
}

async function encryptString(plain) {
  const key = await getAesKey();
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(plain)
  );
  const cipher = new Uint8Array(cipherBuf);
  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv, 0);
  combined.set(cipher, iv.length);
  return arrayBufferToBase64(combined.buffer);
}

async function decryptString(b64) {
  const key = await getAesKey();
  const raw = base64ToUint8Array(b64);
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return textDecoder.decode(dec);
}

function readRawEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.entries)) return [];
    return parsed.entries;
  } catch {
    return [];
  }
}

function writeRawEntries(entries) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, entries })
  );
}

/**
 * Lista contas desencriptadas para o menu (email + senha).
 * @returns {Promise<Array<{ email: string, password: string }>>}
 */
export async function loadRememberedCredentialsList() {
  if (!crypto?.subtle) {
    return [];
  }
  const entries = readRawEntries();
  const out = [];
  for (const row of entries) {
    try {
      const email = await decryptString(row.e);
      const password = await decryptString(row.p);
      out.push({ email, password });
    } catch {
      /* ignora entrada corrompida */
    }
  }
  return out;
}

/**
 * Grava ou atualiza credenciais para o email (substitui se já existir).
 */
export async function saveRememberedCredential(email, password) {
  if (!crypto?.subtle || !email?.trim() || password == null) {
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const current = await loadRememberedCredentialsList();
  const filtered = current.filter(
    (x) => x.email.trim().toLowerCase() !== normalizedEmail
  );
  filtered.push({ email: email.trim(), password: String(password) });

  const entries = [];
  for (const x of filtered) {
    entries.push({
      e: await encryptString(x.email),
      p: await encryptString(x.password)
    });
  }
  writeRawEntries(entries);
}

/** Navegador suporta armazenamento criptografado (HTTPS ou localhost). */
export function isRememberCredentialsSupported() {
  return Boolean(typeof crypto !== "undefined" && crypto.subtle);
}
