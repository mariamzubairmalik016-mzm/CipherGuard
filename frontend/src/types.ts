export type SystemMode = 'email' | 'vpn' | 'signature' | 'cli' | 'comparison';

export interface CryptoKeyPairData {
  id: string;
  owner: string; // e.g., "Alice", "Bob", "VPN Gateway", "Secure Server"
  role: 'sender' | 'recipient' | 'server' | 'client';
  type: 'RSA-OAEP' | 'RSA-PSS' | 'AES-GCM' | 'ECDHE';
  keySize: number;
  publicKeyPem: string;
  privateKeyPem: string;
  // Educational RSA values
  mathPrimes?: {
    p: number;
    q: number;
    n: number;
    phi: number;
    e: number;
    d: number;
  };
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  encryptedBody?: string;
  encryptedSymmetricKey?: string;
  status: 'draft' | 'encrypting' | 'encrypted' | 'transmitting' | 'received' | 'decrypting' | 'decrypted';
}

export interface VpnHandshakeStep {
  stepIndex: number;
  title: string;
  protocolPhase: 'ClientHello' | 'ServerHello' | 'KeyExchange' | 'SessionKeyDerived' | 'TunnelActive';
  description: string;
  asymmetricKeyUsed?: string;
  derivedSymmetricKey?: string;
  status: 'pending' | 'active' | 'completed';
}

export interface NetworkPacket {
  id: string;
  sequence: number;
  source: string;
  destination: string;
  protocol: 'TLS 1.3' | 'IPsec' | 'TCP' | 'HTTP/2';
  payloadPlaintext: string;
  payloadCiphertext: string;
  encrypted: boolean;
  timestamp: string;
  hexDump: string;
}

export interface DigitalSignatureData {
  id: string;
  sender: string;
  messageText: string;
  hashDigestHex: string;
  signatureHex: string;
  isTampered: boolean;
  tamperedMessageText?: string;
  tamperedHashHex?: string;
  verificationStatus: 'idle' | 'signing' | 'signed' | 'verifying' | 'valid' | 'invalid';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  module: SystemMode | 'key-vault' | 'system';
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  details: string;
  metadata?: Record<string, string | number>;
}

export interface CliCommand {
  id: string;
  tool: 'OpenSSL' | 'GnuPG' | 'Wireshark';
  command: string;
  description: string;
  output: string;
  category: 'KeyGen' | 'Encrypt' | 'Decrypt' | 'Sign' | 'Verify' | 'Inspect';
}

export interface MethodComparisonMetric {
  feature: string;
  vpnEncryption: {
    score: number; // 1-10
    detail: string;
  };
  digitalSignature: {
    score: number; // 1-10
    detail: string;
  };
}
