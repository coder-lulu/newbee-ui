import CryptoJS from 'crypto-js';

// ================= WebCrypto AES-GCM helpers (preferred) =================

const hasWebCrypto = typeof crypto !== 'undefined' && !!crypto.subtle;

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function generateAesGcmKey() {
  if (!hasWebCrypto) throw new Error('WebCrypto not available');
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  const raw = await crypto.subtle.exportKey('raw', key);
  const rawBase64 = arrayBufferToBase64(raw);
  return { key, rawBase64 } as const;
}

export async function importAesGcmKeyFromBase64(rawBase64: string): Promise<CryptoKey> {
  if (!hasWebCrypto) throw new Error('WebCrypto not available');
  const raw = base64ToArrayBuffer(rawBase64);
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptWithAesGcm(
  message: string,
  key: CryptoKey,
  iv?: Uint8Array,
) {
  if (!hasWebCrypto) throw new Error('WebCrypto not available');
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const ivLocal = iv ?? crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivLocal }, key, data);
  return {
    cipherTextBase64: arrayBufferToBase64(ct),
    ivBase64: arrayBufferToBase64(ivLocal.buffer),
    iv: ivLocal,
  } as const;
}

export async function decryptWithAesGcm(
  cipherTextBase64: string,
  key: CryptoKey,
  ivBase64: string,
) {
  if (!hasWebCrypto) throw new Error('WebCrypto not available');
  const ctBuf = base64ToArrayBuffer(cipherTextBase64);
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ctBuf);
  const dec = new TextDecoder();
  return dec.decode(pt);
}

function randomUUID() {
  const chars = [
    ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ];
  const uuid = Array.from({ length: 36 });
  let rnd = 0;
  let r: number;
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = '-';
    } else if (i === 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02)
        rnd = Math.trunc(0x2_00_00_00 + Math.random() * 0x1_00_00_00);
      r = rnd & 16;
      rnd = rnd >> 4;
      uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('').replaceAll('-', '').toLowerCase();
}

/**
 * 随机生成aes 密钥
 *
 * @returns aes 密钥
 */
export function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(randomUUID());
}

/**
 * base64编码
 * @param str
 * @returns base64编码
 */
export function encryptBase64(str: CryptoJS.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(str);
}

/**
 * 使用公钥加密
 * @param message 加密内容
 * @param aesKey aesKey
 * @returns 使用公钥加密
 */
export function encryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/**
 * 解密base64
 */
export function decryptBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str);
}

/**
 * 使用密钥对数据进行解密
 */
export function decryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export const webCryptoSupported = hasWebCrypto;
