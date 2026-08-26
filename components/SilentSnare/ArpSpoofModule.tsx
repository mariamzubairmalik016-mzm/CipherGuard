'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Wifi, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Activity,
  Layers,
  Lock,
  Unlock,
  Radio,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { MitmPacket } from '@/lib/types';
import { INITIAL_DEVICES, createSimulatedPacket, evaluateThreats } from '@/lib/mitmEngine';

export const ArpSpoofModule: React.FC = () => {
  const { addAuditLog, addThreatAlert } = useKeyVault();

  const [isArpPoisoned, setIsArpPoisoned] = useState<boolean>(true);
  const [isTlsEncrypted, setIsTlsEncrypted] = useState<boolean>(false);
  const [messageAtoB, setMessageAtoB] = useState<string>('TRANSFER_CREDENTIALS: user=alice_admin, pass=SecretVault99!, target_account=ACC-1002');
  const [tamperedPayload, setTamperedPayload] = useState<string>('TRANSFER_CREDENTIALS: user=alice_admin, pass=MODIFIED_BY_ATTACKER, target_account=ACC-ATTACKER-666');
  
  const [interceptedPacket, setInterceptedPacket] = useState<MitmPacket | null>(null);
  const [receivedByB, setReceivedByB] = useState<string>('');
  const [bStatus, setBStatus] = useState<string>('Idle');

  const handleTransmitFromA = async () => {
    setReceivedByB('');
    setBStatus('Transmitting...');

    const pkt = createSimulatedPacket(
      'two_computers',
      INITIAL_DEVICES.victim_a,
      INITIAL_DEVICES.victim_b,
      isTlsEncrypted ? 'HTTPS (TLS 1.3)' : 'HTTP (Cleartext)',
      messageAtoB,
      isTlsEncrypted,
      isArpPoisoned
    );

    setInterceptedPacket(pkt);

    await fetch('/api/mitm/packets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkt),
    });

    const threats = evaluateThreats(isArpPoisoned, false, isTlsEncrypted, 1);
    for (const t of threats) {
      await addThreatAlert(t);
    }

    if (!isArpPoisoned) {
      setReceivedByB(pkt.rawPayload);
      setBStatus('Delivered Directly (No MITM)');
      await addAuditLog(
        'SilentSnare',
        'INFO',
        'Direct Packet Delivery',
        `Packet transmitted directly from Computer A to Computer B without ARP interception.`
      );
    } else {
      setBStatus('Intercepted by Attacker Gateway');
      await addAuditLog(
        'SilentSnare',
        'WARNING',
        'ARP Interception Triggered',
        `Attacker DE:AD:BE:EF:CA:FE intercepted packet destined for Computer B.`
      );
    }
  };

  const handleForwardAsIs = async () => {
    if (!interceptedPacket) return;
    setReceivedByB(interceptedPacket.rawPayload);
    setBStatus('Received from Attacker (Unchanged)');

    await addAuditLog(
      'SilentSnare',
      'INFO',
      'Attacker Forwarded Packet (Unchanged)',
      `Attacker forwarded packet #${interceptedPacket.id} to Computer B without alteration.`
    );
  };

  const handleTamperAndForward = async () => {
    if (!interceptedPacket) return;
    const modified = isTlsEncrypted 
      ? `[MALFORMED CIPHERTEXT: Attacker altered encrypted payload bits -> TLS HMAC Decryption Error]`
      : tamperedPayload;

    setReceivedByB(modified);
    setBStatus(isTlsEncrypted ? 'TLS Integrity Failure (Dropped)' : 'Received TAMPERED Payload');

    await addAuditLog(
      'SilentSnare',
      isTlsEncrypted ? 'SUCCESS' : 'CRITICAL',
      isTlsEncrypted ? 'TLS Tampering Blocked by MAC Check' : 'Payload Altered by MITM Attacker',
      `Attacker injected modified payload before forwarding to Computer B.`
    );
  };

  const handleDropPacket = async () => {
    if (!interceptedPacket) return;
    setReceivedByB('[PACKET DROPPED BY ATTACKER - TIMEOUT]');
    setBStatus('Packet Dropped (Denial of Service)');

    await addAuditLog(
      'SilentSnare',
      'WARNING',
      'Attacker Dropped Packet (DoS)',
      `Attacker dropped packet #${interceptedPacket.id}. Computer B did not receive transmission.`
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* iOS Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Scenario 1: MITM Attack Between Two Local Hosts
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 font-mono font-bold">
                ARP Spoofing & Ettercap
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              SilentSnare SRS Scenario 1: Attacker uses ARP poisoning to intercept, tamper with, or drop messages between two hosts.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsArpPoisoned(!isArpPoisoned)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
              isArpPoisoned
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-md shadow-rose-900/20'
                : 'glass-pill text-slate-400'
            }`}
          >
            {isArpPoisoned ? 'ARP Poisoning: ACTIVE' : 'ARP Poisoning: DISABLED'}
          </button>

          <button
            onClick={() => setIsTlsEncrypted(!isTlsEncrypted)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 active:scale-95 ${
              isTlsEncrypted
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                : 'bg-amber-950/80 text-amber-300 border-amber-500'
            }`}
          >
            {isTlsEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isTlsEncrypted ? 'HTTPS / TLS 1.3 Active' : 'Unencrypted Cleartext'}</span>
          </button>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node 1: Computer A */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                A
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Computer A (Victim 1)</h3>
                <span className="text-[10px] font-mono text-cyan-400">192.168.1.10 • 00:1A:2B:3C:4D:5E</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message to Computer B:</label>
              <textarea
                rows={3}
                value={messageAtoB}
                onChange={(e) => setMessageAtoB(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-cyan-500 focus:outline-none resize-none font-mono"
              />
            </div>

            <button
              onClick={handleTransmitFromA}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Transmit Packet from Computer A</span>
            </button>
          </div>
        </div>

        {/* Node 2: Attacker Interceptor */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-300">SilentSnare Interceptor</h3>
                <span className="text-[10px] font-mono text-rose-400">192.168.1.105 • DE:AD:BE:EF:CA:FE</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-rose-400 font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800">
              MITM TAP
            </span>
          </div>

          {interceptedPacket ? (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Captured Frame Payload:</span>
                <div className="mt-1 p-3 rounded-2xl bg-black/50 border border-white/10 text-[11px] text-rose-300 break-all max-h-24 overflow-y-auto shadow-inner">
                  {interceptedPacket.rawPayload}
                </div>
              </div>

              {!isTlsEncrypted && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Injected Modified Payload:</label>
                  <textarea
                    rows={2}
                    value={tamperedPayload}
                    onChange={(e) => setTamperedPayload(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-black/50 border border-rose-900/60 text-[11px] text-rose-200 focus:outline-none resize-none font-mono"
                  />
                </div>
              )}

              {/* Action Deck */}
              <div className="grid grid-cols-3 gap-2 font-sans pt-2">
                <button
                  onClick={handleForwardAsIs}
                  className="px-2 py-2 rounded-xl glass-pill hover:bg-white/10 text-slate-200 font-bold text-[11px] transition-all active:scale-95"
                >
                  Forward As-Is
                </button>
                <button
                  onClick={handleTamperAndForward}
                  className="px-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-md shadow-rose-600/20 transition-all active:scale-95"
                >
                  Modify & Forward
                </button>
                <button
                  onClick={handleDropPacket}
                  className="px-2 py-2 rounded-xl bg-black/50 hover:bg-rose-950/80 text-rose-400 font-bold text-[11px] border border-rose-900/60 transition-all active:scale-95"
                >
                  Drop Packet
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-sans">
              Transmit a packet from Computer A to intercept here.
            </div>
          )}
        </div>

        {/* Node 3: Computer B */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                B
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Computer B (Victim 2)</h3>
                <span className="text-[10px] font-mono text-emerald-400">192.168.1.20 • 00:2A:3B:4C:5D:6F</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received Ingress Payload:</span>
              {receivedByB ? (
                <div className={`mt-1 p-3.5 rounded-2xl border text-xs font-mono break-all ${
                  receivedByB.includes('TAMPERED') || receivedByB.includes('MODIFIED')
                    ? 'bg-rose-950/30 border-rose-800 text-rose-300'
                    : 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                }`}>
                  {receivedByB}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center text-xs text-slate-500 mt-1">
                  Awaiting forwarded packet...
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs flex items-center justify-between">
              <span className="text-slate-400">Delivery Status:</span>
              <span className="font-mono text-cyan-300 font-bold">{bStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
