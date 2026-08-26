'use client';

import React, { useState, useEffect } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Activity, 
  Filter, 
  Layers, 
  Search, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Terminal,
  Radio
} from 'lucide-react';
import { MitmPacket } from '@/lib/types';
import { generateHexDump } from '@/lib/cryptoEngine';

export const PacketSniffer: React.FC = () => {
  const { addAuditLog } = useKeyVault();

  const [activeTool, setActiveTool] = useState<'wireshark' | 'ettercap' | 'mitmproxy' | 'burp'>('wireshark');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveSniffing, setIsLiveSniffing] = useState<boolean>(true);
  const [capturedPackets, setCapturedPackets] = useState<MitmPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<MitmPacket | null>(null);

  useEffect(() => {
    const defaultStream: MitmPacket[] = [
      {
        id: 'pkt_01',
        timestamp: new Date(Date.now() - 12000).toLocaleTimeString(),
        scenario: 'two_computers',
        sourceIp: '192.168.1.10',
        destIp: '192.168.1.20',
        sourceMac: '00:1A:2B:3C:4D:5E',
        destMac: 'DE:AD:BE:EF:CA:FE',
        protocol: 'ARP',
        rawPayload: 'Who has 192.168.1.20? Tell 192.168.1.10 (Gratuitous Reply Spoofing)',
        intercepted: true,
        forwarded: true,
        dropped: false,
        tampered: false,
        hexDump: generateHexDump('ARP: 192.168.1.20 is at DE:AD:BE:EF:CA:FE'),
        securityStatus: 'UNSECURED_VULNERABLE',
      },
      {
        id: 'pkt_02',
        timestamp: new Date(Date.now() - 9000).toLocaleTimeString(),
        scenario: 'gateway_spoof',
        sourceIp: '192.168.1.10',
        destIp: '192.168.1.1',
        sourceMac: '00:1A:2B:3C:4D:5E',
        destMac: 'DE:AD:BE:EF:CA:FE',
        protocol: 'SMTP',
        rawPayload: 'AUTH LOGIN\n334 VXNlcm5hbWU6\nYWxpY2VfYWRtaW4=\n334 UGFzc3dvcmQ6\nU2VjcmV0VmF1bHQ5OQ==',
        intercepted: true,
        forwarded: false,
        dropped: false,
        tampered: false,
        hexDump: generateHexDump('SMTP AUTH: alice_admin / SecretVault99!'),
        securityStatus: 'UNSECURED_VULNERABLE',
      },
      {
        id: 'pkt_03',
        timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
        scenario: 'two_computers',
        sourceIp: '192.168.1.10',
        destIp: '192.168.1.1',
        sourceMac: '00:1A:2B:3C:4D:5E',
        destMac: '00:AA:BB:CC:DD:EE',
        protocol: 'TLS 1.3',
        rawPayload: '[TLS 1.3 Application Data | AES-256-GCM | Encrypted Record 512 bytes]',
        intercepted: false,
        forwarded: true,
        dropped: false,
        tampered: false,
        hexDump: generateHexDump('TLSv1.3 Record Layer: Application Data Protocol: http-over-tls'),
        securityStatus: 'TLS_ENCRYPTED_SAFE',
      },
    ];

    setCapturedPackets(defaultStream);
    setSelectedPacket(defaultStream[1]);
  }, []);

  useEffect(() => {
    if (!isLiveSniffing) return;

    const interval = setInterval(() => {
      const protocols = ['HTTP', 'SMTP', 'ARP', 'DNS', 'TLS 1.3', 'TCP'];
      const chosenProto = protocols[Math.floor(Math.random() * protocols.length)];
      const isEncrypted = chosenProto === 'TLS 1.3';

      const newPkt: MitmPacket = {
        id: `pkt_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        scenario: 'general_sniff',
        sourceIp: `192.168.1.${Math.floor(Math.random() * 20 + 10)}`,
        destIp: `192.168.1.${Math.floor(Math.random() * 5 + 1)}`,
        sourceMac: '00:1A:2B:3C:4D:5E',
        destMac: isEncrypted ? '00:AA:BB:CC:DD:EE' : 'DE:AD:BE:EF:CA:FE',
        protocol: chosenProto,
        rawPayload: isEncrypted 
          ? `[TLS 1.3 Encrypted Stream Data | 0x${Math.random().toString(16).substr(2, 8)}]`
          : `GET /api/user-session?token=auth_${Math.random().toString(36).substr(2, 6)} HTTP/1.1`,
        intercepted: !isEncrypted,
        forwarded: true,
        dropped: false,
        tampered: false,
        hexDump: generateHexDump(isEncrypted ? 'TLS Encrypted Byte Flow' : 'Cleartext Token Stream'),
        securityStatus: isEncrypted ? 'TLS_ENCRYPTED_SAFE' : 'UNSECURED_VULNERABLE',
      };

      setCapturedPackets(prev => [newPkt, ...prev.slice(0, 49)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveSniffing]);

  const filteredPackets = capturedPackets.filter(pkt => {
    const matchesProto = protocolFilter === 'ALL' || pkt.protocol.includes(protocolFilter);
    const matchesSearch = searchQuery === '' || 
      pkt.sourceIp.includes(searchQuery) || 
      pkt.destIp.includes(searchQuery) || 
      pkt.rawPayload.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProto && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* iOS Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Real-Time Network Traffic Sniffer & Hex Analyzer
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 font-mono font-bold">
                Wireshark • Ettercap • Mitmproxy
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              SilentSnare SRS 1.6 ii & v: Live packet capture, protocol dissection, and byte-level hex stream analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLiveSniffing(!isLiveSniffing)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
              isLiveSniffing
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLiveSniffing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveSniffing ? 'Pause Sniffer' : 'Resume Live Capture'}</span>
          </button>

          <button
            onClick={() => setCapturedPackets([])}
            className="p-2.5 rounded-2xl glass-pill hover:border-white/20 text-slate-300 transition-all active:scale-95"
            title="Clear Stream"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Switcher & Protocol Filter Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tool Mode:</span>
          {[
            { id: 'wireshark' as const, label: 'Wireshark' },
            { id: 'ettercap' as const, label: 'Ettercap ARP Tap' },
            { id: 'mitmproxy' as const, label: 'Mitmproxy' },
            { id: 'burp' as const, label: 'Burp Suite' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeTool === tool.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'glass-pill text-slate-400 hover:text-white'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['ALL', 'ARP', 'HTTP', 'SMTP', 'TLS', 'TCP'].map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
                protocolFilter === proto
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'glass-pill text-slate-400 hover:text-white'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream Table & Frame Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet Stream */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Captured Traffic ({filteredPackets.length} Frames)
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by IP / string..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-white focus:outline-none w-48 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/5 font-mono text-[11px]">
            {filteredPackets.map((pkt) => (
              <div
                key={pkt.id}
                onClick={() => setSelectedPacket(pkt)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  selectedPacket?.id === pkt.id ? 'bg-cyan-950/60 text-cyan-300' : 'hover:bg-white/[0.04] text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    pkt.securityStatus === 'TLS_ENCRYPTED_SAFE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {pkt.protocol}
                  </span>
                  <span className="text-slate-400 truncate">
                    {pkt.sourceIp} &rarr; {pkt.destIp}
                  </span>
                  <span className="text-slate-500 text-[10px] truncate max-w-[140px]">
                    {pkt.rawPayload}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px] shrink-0 ml-2">{pkt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Packet Frame & Hex Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Layer Dissector & Hex Byte Stream
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeTool.toUpperCase()} Dissector</span>
          </div>

          {selectedPacket ? (
            <div className="space-y-3.5 font-mono text-xs">
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                  <span className="text-cyan-400 font-bold">Layer 2 (Ethernet II):</span> Src: {selectedPacket.sourceMac} &rarr; Dst: {selectedPacket.destMac}
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                  <span className="text-emerald-400 font-bold">Layer 3 (IPv4):</span> Src: {selectedPacket.sourceIp} &rarr; Dst: {selectedPacket.destIp}
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                  <span className="text-indigo-400 font-bold">Layer 4/7 ({selectedPacket.protocol}):</span> Status: {selectedPacket.securityStatus}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Raw Payload Stream:</span>
                <div className="mt-1 p-3.5 rounded-2xl bg-black/60 border border-white/10 text-cyan-300 overflow-x-auto whitespace-pre leading-tight max-h-48 scrollbar-thin shadow-inner">
                  {selectedPacket.hexDump}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-xs text-slate-500 font-sans border border-dashed border-white/10 rounded-2xl bg-black/20">
              Select a packet from the live stream to dissect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
