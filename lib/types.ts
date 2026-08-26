// Shared TypeScript types for CipherGuard (PKE) and SilentSnare (MITM)

export type SimulationMode = 
  | 'overview'
  // CipherGuard (PKE) Modes
  | 'email'
  | 'vpn'
  | 'signature'
  | 'comparison'
  | 'cli'
  // SilentSnare (MITM) Modes
  | 'mitm-arp'
  | 'mitm-gateway'
  | 'packet-sniffer'
  | 'threat-alerts'
  | 'defense-advisor'
  // Documentation & Presentation
  | 'report';

export type UserRole = 'alice' | 'bob' | 'charlie' | 'attacker' | 'gateway';

export interface KeyPairData {
  id: string;
  owner: string;
  role: string;
  type: 'RSA-OAEP' | 'RSA-PSS' | 'AES-GCM' | 'ECDH';
  keySize: number;
  publicKeyPem: string;
  privateKeyPem: string;
  mathPrimes?: {
    p: string;
    q: string;
    n: string;
    e: number;
    d: string;
    phi: string;
  };
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  encryptedBody?: string;
  status: 'draft' | 'encrypted' | 'transmitted' | 'intercepted' | 'modified' | 'decrypted' | 'failed';
  isEncrypted: boolean;
  isTampered?: boolean;
  tamperedBy?: string;
  originalBody?: string;
  timestamp: string;
}

export interface VpnPacket {
  id: string;
  sequence: number;
  source: string;
  destination: string;
  protocol: 'TLS 1.3' | 'IPsec' | 'TCP' | 'UDP' | 'ARP' | 'HTTP' | 'SMTP';
  payloadPlaintext: string;
  payloadCiphertext: string;
  encrypted: boolean;
  timestamp: string;
  hexDump?: string;
  tlsHandshakeStep?: string;
}

export interface DigitalSignatureRecord {
  id: string;
  sender: string;
  messageText: string;
  hashDigestHex: string;
  signatureHex: string;
  isTampered: boolean;
  tamperedMessage?: string;
  verificationStatus: 'PENDING' | 'VALID' | 'TAMPERED_INVALID' | 'UNVERIFIED';
  timestamp: string;
}

export interface MitmPacket {
  id: string;
  timestamp: string;
  scenario: 'two_computers' | 'gateway_spoof' | 'general_sniff';
  sourceIp: string;
  destIp: string;
  sourceMac: string;
  destMac: string;
  protocol: string;
  rawPayload: string;
  modifiedPayload?: string;
  intercepted: boolean;
  forwarded: boolean;
  dropped: boolean;
  tampered: boolean;
  hexDump: string;
  securityStatus: 'UNSECURED_VULNERABLE' | 'TLS_ENCRYPTED_SAFE' | 'TAMPERED';
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'ARP_POISONING' | 'PLAINTEXT_CREDENTIALS' | 'GATEWAY_SPOOF' | 'SIGNATURE_MISMATCH' | 'UNENCRYPTED_EMAIL';
  title: string;
  description: string;
  mitigation: string;
  resolved: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  module: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'ALERT';
  title: string;
  details: string;
}
