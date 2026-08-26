// Client-side & Server-side Cryptographic Engine powered by W3C Web Crypto API

// Helper to convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to convert ArrayBuffer to Hex string
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Generate Realistic Small Primes for RSA Educational Math Explorer
const PRIME_POOL = [
  61, 53, 47, 43, 41, 37, 31, 29, 23, 19, 17, 13, 11, 7, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149
];

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function modInverse(e: number, phi: number): number {
  let m0 = phi;
  let y = 0, x = 1;
  if (phi === 1) return 0;
  while (e > 1) {
    const q = Math.floor(e / phi);
    let t = phi;
    phi = e % phi;
    e = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0) x += m0;
  return x;
}

export function generateEducationalRsaMath() {
  const shuffled = [...PRIME_POOL].sort(() => 0.5 - Math.random());
  const p = shuffled[0];
  const q = shuffled[1];
  const n = p * q;
  const phi = (p - 1) * (q - 1);

  // Common public exponent candidates
  const eCandidates = [65537, 17, 7, 5, 3];
  let e = 65537;
  for (const cand of eCandidates) {
    if (cand < phi && gcd(cand, phi) === 1) {
      e = cand;
      break;
    }
  }
  const d = modInverse(e, phi);

  return {
    p: p.toString(),
    q: q.toString(),
    n: n.toString(),
    e: e,
    d: d.toString(),
    phi: phi.toString(),
  };
}

// Export CryptoKey to PEM
export async function exportKeyToPem(key: CryptoKey, type: 'public' | 'private'): Promise<string> {
  if (typeof window === 'undefined') return 'PEM_SERVER_STUB';
  const format = type === 'public' ? 'spki' : 'pkcs8';
  const exported = await window.crypto.subtle.exportKey(format, key);
  const exportedAsString = arrayBufferToBase64(exported);
  const header = type === 'public' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN PRIVATE KEY-----';
  const footer = type === 'public' ? '-----END PUBLIC KEY-----' : '-----END PRIVATE KEY-----';
  
  // Wrap lines at 64 chars
  const formatted = exportedAsString.match(/.{1,64}/g)?.join('\n') || exportedAsString;
  return `${header}\n${formatted}\n${footer}`;
}

// Generate RSA-OAEP Key Pair (Encryption / Decryption)
export async function generateRsaOaepKeyPair(keySize: number = 2048): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
  privateKeyPem: string;
}> {
  if (typeof window === 'undefined') {
    return {
      publicKey: {} as CryptoKey,
      privateKey: {} as CryptoKey,
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
      privateKeyPem: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEA...\n-----END PRIVATE KEY-----',
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyPem = await exportKeyToPem(keyPair.publicKey, 'public');
  const privateKeyPem = await exportKeyToPem(keyPair.privateKey, 'private');

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPem,
    privateKeyPem,
  };
}

// Generate RSA-PSS Key Pair (Digital Signatures)
export async function generateRsaPssKeyPair(keySize: number = 2048): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
  privateKeyPem: string;
}> {
  if (typeof window === 'undefined') {
    return {
      publicKey: {} as CryptoKey,
      privateKey: {} as CryptoKey,
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----',
      privateKeyPem: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFA...\n-----END PRIVATE KEY-----',
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyPem = await exportKeyToPem(keyPair.publicKey, 'public');
  const privateKeyPem = await exportKeyToPem(keyPair.privateKey, 'private');

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPem,
    privateKeyPem,
  };
}

// Encrypt plaintext with RSA-OAEP Public Key
export async function encryptWithRsaOaep(publicKey: CryptoKey, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  return arrayBufferToBase64(encryptedBuffer);
}

// Decrypt ciphertext with RSA-OAEP Private Key
export async function decryptWithRsaOaep(privateKey: CryptoKey, ciphertextBase64: string): Promise<string> {
  const buffer = base64ToArrayBuffer(ciphertextBase64);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    buffer
  );
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Calculate SHA-256 Hash Digest
export async function calculateSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToHex(hashBuffer);
}

// Sign message with RSA-PSS Private Key
export async function signWithRsaPss(privateKey: CryptoKey, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateKey,
    data
  );
  return arrayBufferToHex(signatureBuffer);
}

// Verify signature with RSA-PSS Public Key
export async function verifyWithRsaPss(
  publicKey: CryptoKey,
  signatureHex: string,
  message: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Hex to ArrayBuffer
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return false;
    const sigBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));

    return await window.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      publicKey,
      sigBytes.buffer,
      data
    );
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

// Generate Realistic Wireshark Hex Dump View
export function generateHexDump(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const lines: string[] = [];
  
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(4, '0');
    
    const hexPart = Array.from(chunk)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
      .padEnd(48, ' ');
    
    const asciiPart = Array.from(chunk)
      .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('');
    
    lines.push(`0x${offset}  ${hexPart}  |${asciiPart}|`);
  }
  
  return lines.join('\n');
}

// Simulate AES-256-GCM symmetric packet encryption
export function simulateAes256Gcm(plaintext: string, sessionKeyHex: string): { ciphertextHex: string; ivHex: string; tagHex: string } {
  let hash = 0;
  for (let i = 0; i < sessionKeyHex.length; i++) {
    hash = (hash << 5) - hash + sessionKeyHex.charCodeAt(i);
    hash |= 0;
  }
  
  const bytes = new TextEncoder().encode(plaintext);
  const cipherBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    cipherBytes[i] = bytes[i] ^ ((hash + i * 31) & 0xff);
  }
  
  const ciphertextHex = arrayBufferToHex(cipherBytes.buffer);
  const ivHex = 'a1b2c3d4e5f60718';
  const tagHex = '9f8e7d6c5b4a3928';
  
  return { ciphertextHex, ivHex, tagHex };
}
