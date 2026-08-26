import React, { useState } from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { SimulationControls } from '../Common/SimulationControls';
import { generateAESSymmetricKey, encryptAESGCM } from '../../cryptoEngine';
import type { NetworkPacket, VpnHandshakeStep } from '../../types';
import { Lock, Laptop, Eye, RefreshCw, CheckCircle2, Radio, Terminal, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VpnHandshakeModule: React.FC = () => {
  const { addAuditLog } = useKeyVault();

  const [handshakeStep, setHandshakeStep] = useState<number>(0);
  const [sessionKeyHex, setSessionKeyHex] = useState<string>('');
  const [tunnelActive, setTunnelActive] = useState<boolean>(false);
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<NetworkPacket | null>(null);

  const [inputPayload, setInputPayload] = useState<string>('GET /financial-data HTTP/1.1\nHost: secure.bank.corp\nAuthorization: Bearer cipher_token_99');

  const handshakeSequence: VpnHandshakeStep[] = [
    {
      stepIndex: 0,
      title: '1. Client Hello (TLS 1.3)',
      protocolPhase: 'ClientHello',
      description: 'Client initiates handshake, offering supported cipher suites (TLS_AES_256_GCM_SHA384).',
      status: 'pending',
    },
    {
      stepIndex: 1,
      title: '2. Server Hello & Certificate',
      protocolPhase: 'ServerHello',
      description: 'VPN Gateway responds with Server Public Key Certificate (RSA-2048).',
      status: 'pending',
    },
    {
      stepIndex: 2,
      title: '3. Asymmetric Key Exchange (PKE)',
      protocolPhase: 'KeyExchange',
      description: 'Client & Gateway exchange asymmetric pre-master key to derive symmetric session key.',
      status: 'pending',
    },
    {
      stepIndex: 3,
      title: '4. Symmetric Session Key Derived',
      protocolPhase: 'SessionKeyDerived',
      description: 'Both parties independently derive matching AES-256-GCM symmetric tunnel key.',
      status: 'pending',
    },
    {
      stepIndex: 4,
      title: '5. Encrypted Tunnel Established',
      protocolPhase: 'TunnelActive',
      description: 'All subsequent payload data transmitted through encrypted AES-256-GCM tunnel.',
      status: 'pending',
    },
  ];

  const handleStartHandshake = async () => {
    setHandshakeStep(1);
    setTunnelActive(false);

    addAuditLog({
      module: 'vpn',
      severity: 'info',
      title: 'VPN Handshake Initiated',
      details: 'Client sending TLS 1.3 ClientHello to VPN Gateway.',
    });

    // Step 1: Client Hello packet
    const p1: NetworkPacket = {
      id: 'pkt-1',
      sequence: 1,
      source: '192.168.1.100 (Client)',
      destination: '10.0.0.1 (VPN Gateway)',
      protocol: 'TLS 1.3',
      payloadPlaintext: 'ClientHello: CipherSuites=TLS_AES_256_GCM_SHA384',
      payloadCiphertext: 'ClientHello: CipherSuites=TLS_AES_256_GCM_SHA384 (Unencrypted Handshake Frame)',
      encrypted: false,
      timestamp: new Date().toLocaleTimeString(),
      hexDump: '16 03 01 00 f8 01 00 00 f4 03 03...',
    };
    setPackets([p1]);

    setTimeout(() => {
      setHandshakeStep(2);
      addAuditLog({
        module: 'vpn',
        severity: 'info',
        title: 'Server Hello & RSA Certificate Received',
        details: 'VPN Gateway presented 2048-bit RSA Certificate.',
      });
      const p2: NetworkPacket = {
        id: 'pkt-2',
        sequence: 2,
        source: '10.0.0.1 (VPN Gateway)',
        destination: '192.168.1.100 (Client)',
        protocol: 'TLS 1.3',
        payloadPlaintext: 'ServerHello + Certificate [VPN_Gateway_RSA_2048]',
        payloadCiphertext: 'ServerHello + Certificate [VPN_Gateway_RSA_2048]',
        encrypted: false,
        timestamp: new Date().toLocaleTimeString(),
        hexDump: '16 03 03 00 59 02 00 00 55 03 03...',
      };
      setPackets(prev => [...prev, p2]);
    }, 1200);

    setTimeout(() => {
      setHandshakeStep(3);
      // Generate symmetric AES key
      const key = generateAESSymmetricKey();
      setSessionKeyHex(key);

      addAuditLog({
        module: 'vpn',
        severity: 'info',
        title: 'Asymmetric Key Exchange Complete',
        details: `Derived AES-256 Symmetric Session Key: ${key.slice(0, 16)}...`,
      });
      const p3: NetworkPacket = {
        id: 'pkt-3',
        sequence: 3,
        source: '192.168.1.100 (Client)',
        destination: '10.0.0.1 (VPN Gateway)',
        protocol: 'TLS 1.3',
        payloadPlaintext: 'KeyExchange: Asymmetric Session Seed',
        payloadCiphertext: 'KeyExchange: Encrypted Seed payload',
        encrypted: false,
        timestamp: new Date().toLocaleTimeString(),
        hexDump: '16 03 03 00 46 16 00 00 42 00 20...',
      };
      setPackets(prev => [...prev, p3]);
    }, 2400);

    setTimeout(() => {
      setHandshakeStep(4);
      setTunnelActive(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });

      addAuditLog({
        module: 'vpn',
        severity: 'success',
        title: 'Encrypted VPN Tunnel Established',
        details: 'Switching from Asymmetric PKE to Symmetric AES-256-GCM Encryption for high-performance data transfer.',
      });
    }, 3600);
  };

  // Transmit Data Packet through Active Tunnel
  const handleTransmitTunnelPacket = async () => {
    if (!tunnelActive || !sessionKeyHex) return;

    const encRes = await encryptAESGCM(inputPayload, sessionKeyHex);

    const newPkt: NetworkPacket = {
      id: `pkt-${packets.length + 1}`,
      sequence: packets.length + 1,
      source: '192.168.1.100 (Client)',
      destination: '10.0.0.1 (VPN Gateway)',
      protocol: 'IPsec',
      payloadPlaintext: inputPayload,
      payloadCiphertext: `AES_GCM_256[IV:${encRes.ivHex.slice(0, 8)}] ${encRes.ciphertextHex}`,
      encrypted: true,
      timestamp: new Date().toLocaleTimeString(),
      hexDump: encRes.ciphertextHex.slice(0, 32) + '...',
    };

    setPackets(prev => [...prev, newPkt]);
    addAuditLog({
      module: 'vpn',
      severity: 'info',
      title: 'Transmitted Encrypted Tunnel Packet',
      details: `Packet #${newPkt.sequence} encrypted with AES-256-GCM. Ciphertext length: ${encRes.ciphertextHex.length} hex chars.`,
    });
  };

  const handleReset = () => {
    setHandshakeStep(0);
    setTunnelActive(false);
    setSessionKeyHex('');
    setPackets([]);
    setSelectedPacket(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">VPN Handshake & Secure Tunnel Establishment</h2>
              <span className="text-xs text-blue-400 font-mono">TLS 1.3 / IPsec Dual Encryption Model</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Demonstrates how Public Key Encryption (PKE) is used in the handshake phase to exchange symmetric keys, after which bulk data is transmitted via high-performance symmetric encryption (AES-256-GCM).
          </p>
        </div>

        <button
          onClick={handleStartHandshake}
          disabled={handshakeStep > 0 && handshakeStep < 4}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${handshakeStep > 0 && handshakeStep < 4 ? 'animate-spin' : ''}`} />
          <span>{tunnelActive ? 'Re-Establish Handshake' : 'Start VPN Handshake'}</span>
        </button>
      </div>

      {/* Simulation Controls */}
      <SimulationControls onReset={handleReset} />

      {/* Handshake Visualizer Stepper */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>TLS 1.3 Handshake Protocol Progression</span>
          {tunnelActive && (
            <span className="text-emerald-400 font-mono text-xs flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>TUNNEL ACTIVE</span>
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {handshakeSequence.map((step, idx) => {
            const isCurrent = handshakeStep === idx + 1;
            const isDone = handshakeStep > idx + 1 || (handshakeStep === 4 && idx === 4);
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-500 text-white ring-1 ring-cyan-400'
                    : isDone
                    ? 'bg-slate-950 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono font-bold mb-1">PHASE 0{idx + 1}</div>
                <div className="font-semibold text-xs text-slate-200">{step.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{step.description}</div>
              </div>
            );
          })}
        </div>

        {/* Derived Symmetric Session Key Vault Card */}
        {sessionKeyHex && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-300">Derived AES-256 Symmetric Session Key</div>
                <div className="text-[11px] font-mono text-slate-400 break-all">{sessionKeyHex}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono shrink-0">
              High-Speed Tunnel Cipher
            </span>
          </div>
        )}
      </div>

      {/* Network Nodes & Encrypted Tunnel Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Client Node */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Laptop className="w-6 h-6 text-cyan-400" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">VPN Client Node</h4>
              <p className="text-[11px] font-mono text-slate-400">IP: 192.168.1.100</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Payload to Transmit</label>
              <textarea
                rows={3}
                value={inputPayload}
                onChange={e => setInputPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleTransmitTunnelPacket}
              disabled={!tunnelActive}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Radio className="w-4 h-4" />
              <span>Push Packet Through Tunnel</span>
            </button>
          </div>
        </div>

        {/* Wireshark Packet Inspector Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-sm">Wireshark Packet Stream Inspector</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Packets Captured: {packets.length}</span>
          </div>

          {/* Packet Table */}
          <div className="overflow-x-auto max-h-64 overflow-y-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950">
                  <th className="p-2">No.</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Source</th>
                  <th className="p-2">Protocol</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {packets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 font-sans italic">
                      No network packets captured yet. Initiate handshake to start.
                    </td>
                  </tr>
                ) : (
                  packets.map(pkt => (
                    <tr key={pkt.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2 font-bold text-cyan-400">#{pkt.sequence}</td>
                      <td className="p-2 text-slate-400">{pkt.timestamp}</td>
                      <td className="p-2 text-slate-300">{pkt.source}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {pkt.protocol}
                        </span>
                      </td>
                      <td className="p-2">
                        {pkt.encrypted ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            AES Encrypted
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
                            Handshake Frame
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => setSelectedPacket(pkt)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Selected Packet Frame Detail */}
          {selectedPacket && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1">
                <span>Packet #{selectedPacket.sequence} Frame Breakdown ({selectedPacket.protocol})</span>
                <button onClick={() => setSelectedPacket(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="text-slate-400">Plaintext Data: <span className="text-slate-200 font-sans">{selectedPacket.payloadPlaintext}</span></div>
              <div className="text-slate-400">Transmitted Ciphertext: <span className="text-cyan-400 break-all">{selectedPacket.payloadCiphertext}</span></div>
              <div className="text-slate-400">Hex Dump: <span className="text-amber-400">{selectedPacket.hexDump}</span></div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
