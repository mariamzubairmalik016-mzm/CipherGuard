// Simulation Engine for SilentSnare (MITM Attack & Interceptor Module)
import { MitmPacket, ThreatAlert } from './types';
import { generateHexDump } from './cryptoEngine';

export interface NetworkDevice {
  name: string;
  ip: string;
  mac: string;
  role: 'victim_a' | 'victim_b' | 'attacker' | 'gateway';
  arpTable: Record<string, string>; // IP -> MAC
}

export const INITIAL_DEVICES: Record<string, NetworkDevice> = {
  victim_a: {
    name: 'Computer A (Victim 1)',
    ip: '192.168.1.10',
    mac: '00:1A:2B:3C:4D:5E',
    role: 'victim_a',
    arpTable: {
      '192.168.1.20': '00:2A:3B:4C:5D:6F', // Computer B
      '192.168.1.1': '00:AA:BB:CC:DD:EE',  // Gateway
    },
  },
  victim_b: {
    name: 'Computer B (Victim 2)',
    ip: '192.168.1.20',
    mac: '00:2A:3B:4C:5D:6F',
    role: 'victim_b',
    arpTable: {
      '192.168.1.10': '00:1A:2B:3C:4D:5E', // Computer A
      '192.168.1.1': '00:AA:BB:CC:DD:EE',  // Gateway
    },
  },
  attacker: {
    name: 'SilentSnare Interceptor (Kali / Ettercap)',
    ip: '192.168.1.105',
    mac: 'DE:AD:BE:EF:CA:FE',
    role: 'attacker',
    arpTable: {
      '192.168.1.10': '00:1A:2B:3C:4D:5E',
      '192.168.1.20': '00:2A:3B:4C:5D:6F',
      '192.168.1.1': '00:AA:BB:CC:DD:EE',
    },
  },
  gateway: {
    name: 'Default Gateway (Router)',
    ip: '192.168.1.1',
    mac: '00:AA:BB:CC:DD:EE',
    role: 'gateway',
    arpTable: {
      '192.168.1.10': '00:1A:2B:3C:4D:5E',
      '192.168.1.20': '00:2A:3B:4C:5D:6F',
      '192.168.1.105': 'DE:AD:BE:EF:CA:FE',
    },
  },
};

// Create simulated packet between nodes
export function createSimulatedPacket(
  scenario: 'two_computers' | 'gateway_spoof' | 'general_sniff',
  sourceDevice: NetworkDevice,
  destDevice: NetworkDevice,
  protocol: string,
  rawPayload: string,
  isTlsEncrypted: boolean,
  isArpPoisoned: boolean
): MitmPacket {
  const id = `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const timestamp = new Date().toLocaleTimeString();

  // If TLS encrypted, payload appears as opaque high-entropy ciphertext
  const effectivePayload = isTlsEncrypted
    ? `[TLS 1.3 Encrypted Record | Ciphertext: 0x${Array.from(new TextEncoder().encode(rawPayload)).map(b => (b ^ 0xaa).toString(16).padStart(2, '0')).join('')} | HMAC-SHA256 Validated]`
    : rawPayload;

  const hexDump = generateHexDump(effectivePayload);

  return {
    id,
    timestamp,
    scenario,
    sourceIp: sourceDevice.ip,
    destIp: destDevice.ip,
    sourceMac: sourceDevice.mac,
    destMac: isArpPoisoned ? 'DE:AD:BE:EF:CA:FE' : destDevice.mac,
    protocol,
    rawPayload: effectivePayload,
    modifiedPayload: undefined,
    intercepted: isArpPoisoned,
    forwarded: false,
    dropped: false,
    tampered: false,
    hexDump,
    securityStatus: isTlsEncrypted 
      ? 'TLS_ENCRYPTED_SAFE' 
      : (isArpPoisoned ? 'UNSECURED_VULNERABLE' : 'UNSECURED_VULNERABLE'),
  };
}

// Generate threat alerts when suspicious activity occurs
export function evaluateThreats(
  isArpPoisoned: boolean,
  isGatewaySpoofed: boolean,
  isTlsActive: boolean,
  unencryptedTransfersCount: number
): ThreatAlert[] {
  const alerts: ThreatAlert[] = [];

  if (isArpPoisoned) {
    alerts.push({
      id: 'alert_arp_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'CRITICAL',
      type: 'ARP_POISONING',
      title: 'ARP Cache Poisoning Detected (Ettercap / Arpspoof)',
      description: 'Gratuitous ARP replies observed mapping 192.168.1.20 and 192.168.1.10 to Attacker MAC DE:AD:BE:EF:CA:FE.',
      mitigation: 'Enable Dynamic ARP Inspection (DAI) on switch ports or configure static ARP tables.',
      resolved: false,
    });
  }

  if (isGatewaySpoofed) {
    alerts.push({
      id: 'alert_gw_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'CRITICAL',
      type: 'GATEWAY_SPOOF',
      title: 'Default Gateway Impersonation Active',
      description: 'Host DE:AD:BE:EF:CA:FE is claiming the Default Gateway IP (192.168.1.1), intercepting outbound WAN/Email traffic.',
      mitigation: 'Implement 802.1X Port Security, DHCP Snooping, and Secure First-Hop Redundancy protocols (VRRP-E / IPsec).',
      resolved: false,
    });
  }

  if (!isTlsActive && unencryptedTransfersCount > 0) {
    alerts.push({
      id: 'alert_plain_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'HIGH',
      type: 'UNENCRYPTED_EMAIL',
      title: 'Cleartext Protocol Vulnerability',
      description: 'Unencrypted SMTP/HTTP traffic detected in transit over unverified local segment. Credentials & email contents readable.',
      mitigation: 'Enforce Mandatory STARTTLS (port 587/465), HTTPS Strict Transport Security (HSTS), and PKE S/MIME email signing.',
      resolved: false,
    });
  }

  return alerts;
}
