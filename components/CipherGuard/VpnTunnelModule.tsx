'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Radio, 
  Lock, 
  Unlock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Play, 
  RotateCcw,
  Send,
  Sparkles,
  Layers
} from 'lucide-react';
import { VpnPacket } from '@/lib/types';
import { generateHexDump, simulateAes256Gcm } from '@/lib/cryptoEngine';

export const VpnTunnelModule: React.FC = () => {
  const { addAuditLog } = useKeyVault();

  const [handshakeStep, setHandshakeStep] = useState<number>(0);
  const [isTunnelEstablished, setIsTunnelEstablished] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string>('');
  const [payloadInput, setPayloadInput] = useState<string>('GET /secure-internal-gateway/financial-records.pdf HTTP/1.1');
  const [packets, setPackets] = useState<VpnPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<VpnPacket | null>(null);

  const handshakeStages = [
    { step: 1, name: 'ClientHello', desc: 'Client initiates connection with supported cipher suites (TLS_AES_256_GCM_SHA384, ECDHE-256).' },
    { step: 2, name: 'ServerHello + Cert', desc: 'Server responds with chosen cipher suite and presents X.509 certificate.' },
    { step: 3, name: 'PKE Key Exchange', desc: 'Client & Server exchange ephemeral public keys to compute shared secret.' },
    { step: 4, name: 'Session Key Derived', desc: 'HKDF expands shared secret into 256-bit symmetric key (AES-256-GCM).' },
    { step: 5, name: 'Tunnel Active', desc: 'Handshake complete. All bulk traffic encrypted with AES-256-GCM.' },
  ];

  const handleStartHandshake = async () => {
    setHandshakeStep(1);
    setIsTunnelEstablished(false);

    for (let i = 1; i <= 5; i++) {
      setHandshakeStep(i);
      if (i === 4) {
        const derivedKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        setSessionKey(derivedKey);
      }
      await new Promise(r => setTimeout(r, 600));
    }

    setIsTunnelEstablished(true);
    await addAuditLog(
      'VPNTunnel',
      'SUCCESS',
      'TLS 1.3 VPN Handshake Completed',
      `Established secure AES-256-GCM tunnel. Symmetric session key active.`
    );
  };

  const handleSendPacket = async () => {
    if (!isTunnelEstablished && !payloadInput) return;

    const { ciphertextHex } = simulateAes256Gcm(payloadInput, sessionKey || 'fallback_key_123');
    const hex = generateHexDump(isTunnelEstablished ? ciphertextHex : payloadInput);

    const newPacket: VpnPacket = {
      id: `pkt_${Date.now()}`,
      sequence: packets.length + 1,
      source: '10.0.0.2 (VPN Client)',
      destination: '10.0.0.1 (VPN Gateway)',
      protocol: isTunnelEstablished ? 'TLS 1.3' : 'TCP',
      payloadPlaintext: payloadInput,
      payloadCiphertext: ciphertextHex,
      encrypted: isTunnelEstablished,
      timestamp: new Date().toLocaleTimeString(),
      hexDump: hex,
      tlsHandshakeStep: 'Data Record',
    };

    setPackets(prev => [newPacket, ...prev]);
    setSelectedPacket(newPacket);

    await fetch('/api/vpn/packets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPacket),
    });

    await addAuditLog(
      'VPNTunnel',
      'INFO',
      'VPN Tunnel Packet Transmitted',
      `Packet #${newPacket.sequence} routed via ${newPacket.protocol} (${isTunnelEstablished ? 'Encrypted AES-GCM' : 'Cleartext'}).`
    );
  };

  const handleReset = () => {
    setHandshakeStep(0);
    setIsTunnelEstablished(false);
    setSessionKey('');
    setPackets([]);
    setSelectedPacket(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              VPN Handshake & Encrypted Tunnel Establishment
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                TLS 1.3 / IPsec Hybrid
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Ephemeral PKE Handshake: Negotiates a hardware-accelerated symmetric session key (AES-256-GCM) for tunnel throughput.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartHandshake}
            disabled={handshakeStep > 0 && handshakeStep < 5}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-slate-950" />
            <span>{isTunnelEstablished ? 'Re-Handshake' : 'Start TLS 1.3 Handshake'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl glass-pill hover:border-emerald-500/50 text-zinc-300 transition-all active:scale-95"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Handshake Progress Pipeline */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              TLS 1.3 Handshake Protocol Progression
            </h3>
          </div>
          {isTunnelEstablished && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" /> TUNNEL SECURED (AES-256-GCM)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {handshakeStages.map((stage) => {
            const isCompleted = handshakeStep >= stage.step;
            const isCurrent = handshakeStep === stage.step;

            return (
              <div
                key={stage.step}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400'
                    : isCompleted
                    ? 'bg-black/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-black/30 border-white/5 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold">Stage 0{stage.step}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-2">{stage.name}</div>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-3 leading-relaxed font-sans">{stage.desc}</p>
              </div>
            );
          })}
        </div>

        {sessionKey && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs shadow-inner">
            <span className="text-zinc-300 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Derived Symmetric Session Key (Shared Secret):
            </span>
            <span className="font-mono text-amber-300 font-bold bg-black/70 px-3 py-1 rounded-xl border border-amber-800">
              0x{sessionKey}... (AES-256-GCM)
            </span>
          </div>
        )}
      </div>

      {/* Packet Stream & Hex Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet Injection Lab */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Inject Packet Into Tunnel
            </h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
              isTunnelEstablished ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {isTunnelEstablished ? 'TUNNEL ENCRYPTED' : 'CLEARTEXT TCP'}
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Application Payload (HTTP Request):</label>
              <textarea
                rows={3}
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none font-mono"
              />
            </div>

            <button
              onClick={handleSendPacket}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Transmit Packet ({isTunnelEstablished ? 'Flow via AES-256 Tunnel' : 'Unsecured Wire'})</span>
            </button>
          </div>

          {/* Captured Packet Table */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live Packet Capture Stream:</span>
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-black/50 divide-y divide-white/5 font-mono text-[11px]">
              {packets.length > 0 ? (
                packets.map((pkt) => (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      selectedPacket?.id === pkt.id ? 'bg-emerald-950/60 text-emerald-300' : 'hover:bg-white/[0.04] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500">#{pkt.sequence}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        pkt.encrypted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {pkt.protocol}
                      </span>
                      <span className="text-zinc-400">{pkt.source} &rarr; {pkt.destination}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{pkt.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500 font-sans">
                  No packets sent yet. Click Transmit Packet above to stream traffic.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wireshark Packet Hex Dump Inspector */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Wireshark Stream Hex Inspector
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Byte Analysis</span>
          </div>

          {selectedPacket ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-black/50 border border-white/10">
                <div><span className="text-zinc-500">Seq:</span> #{selectedPacket.sequence}</div>
                <div><span className="text-zinc-500">Proto:</span> {selectedPacket.protocol}</div>
                <div><span className="text-zinc-500">Src:</span> {selectedPacket.source}</div>
                <div><span className="text-zinc-500">Dst:</span> {selectedPacket.destination}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Raw Wireshark Frame Hex:</span>
                <div className="mt-1 p-3.5 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto scrollbar-thin whitespace-pre leading-tight max-h-56 shadow-inner">
                  {selectedPacket.hexDump}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-zinc-500">
              Select or transmit a packet to view Wireshark frame bytes and hex breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
