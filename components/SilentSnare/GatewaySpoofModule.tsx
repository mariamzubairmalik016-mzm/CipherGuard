'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Server, 
  Mail, 
  AlertTriangle, 
  Send, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ArrowRight,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { MitmPacket } from '@/lib/types';
import { INITIAL_DEVICES, createSimulatedPacket, evaluateThreats } from '@/lib/mitmEngine';

export const GatewaySpoofModule: React.FC = () => {
  const { addAuditLog, addThreatAlert } = useKeyVault();

  const [isGatewaySpoofed, setIsGatewaySpoofed] = useState<boolean>(true);
  const [isTlsActive, setIsTlsActive] = useState<boolean>(false);
  const [emailSender, setEmailSender] = useState<string>('cfo@enterprise-corp.com');
  const [emailRecipient, setEmailRecipient] = useState<string>('vendor@supplier.com');
  const [emailSubject, setEmailSubject] = useState<string>('Invoice Payment Verification #9812');
  const [emailContent, setEmailContent] = useState<string>(
    'Please proceed with releasing $120,000 to Supplier Account #US-5544-3322 at Bank of America.'
  );

  const [modifiedRecipient, setModifiedRecipient] = useState<string>('attacker-drop@darknet.io');
  const [modifiedContent, setModifiedContent] = useState<string>(
    'URGENT INVOICE REVISION: Wire $120,000 immediately to Attacker Offshore Account #KY-9900-1111 at Cayman Island Bank.'
  );

  const [capturedPacket, setCapturedPacket] = useState<MitmPacket | null>(null);
  const [finalDelivery, setFinalDelivery] = useState<{
    recipient: string;
    content: string;
    status: string;
    isCompromised: boolean;
  } | null>(null);

  const handleSendOutboundEmail = async () => {
    setFinalDelivery(null);

    const pkt = createSimulatedPacket(
      'gateway_spoof',
      INITIAL_DEVICES.victim_a,
      INITIAL_DEVICES.gateway,
      isTlsActive ? 'SMTP over TLS (Port 587)' : 'Cleartext SMTP (Port 25)',
      `MAIL FROM:<${emailSender}>\nRCPT TO:<${emailRecipient}>\nSUBJECT: ${emailSubject}\n\n${emailContent}`,
      isTlsActive,
      isGatewaySpoofed
    );

    setCapturedPacket(pkt);

    await fetch('/api/mitm/packets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkt),
    });

    const threats = evaluateThreats(false, isGatewaySpoofed, isTlsActive, 1);
    for (const t of threats) {
      await addThreatAlert(t);
    }

    if (!isGatewaySpoofed) {
      setFinalDelivery({
        recipient: emailRecipient,
        content: emailContent,
        status: 'Delivered Legitimately through Default Gateway',
        isCompromised: false,
      });
      await addAuditLog(
        'GatewaySpoof',
        'INFO',
        'Outbound Email Routed Normally',
        `Email sent to ${emailRecipient} via genuine Default Gateway 192.168.1.1.`
      );
    } else {
      await addAuditLog(
        'GatewaySpoof',
        'WARNING',
        'Gateway Spoofed: Outbound Email Intercepted',
        `Email traffic diverted to Attacker Gateway DE:AD:BE:EF:CA:FE before WAN egress.`
      );
    }
  };

  const handleForwardAlteredEmail = async () => {
    if (!capturedPacket) return;

    if (isTlsActive) {
      setFinalDelivery({
        recipient: emailRecipient,
        content: '[TLS HANDSHAKE ENCRYPTED - Attacker cannot alter plaintext without certificate private key. Original verified delivery preserved]',
        status: 'Delivered Securely (TLS Protected Against MITM Modification)',
        isCompromised: false,
      });
      await addAuditLog(
        'GatewaySpoof',
        'SUCCESS',
        'TLS Protected Email from Gateway Modification',
        `TLS 1.3 / STARTTLS encrypted envelope blocked attacker modification.`
      );
    } else {
      setFinalDelivery({
        recipient: modifiedRecipient,
        content: modifiedContent,
        status: 'COMPROMISED: Altered Email Received by Vendor',
        isCompromised: true,
      });
      await addAuditLog(
        'GatewaySpoof',
        'CRITICAL',
        'Email Hijacked and Altered on Spoofed Gateway',
        `Attacker modified payment routing numbers to offshore bank account.`
      );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* iOS Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Scenario 2: MITM in Email Hijacking via Gateway Spoofing
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 font-mono font-bold">
                Router Impersonation & SMTP Hijack
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              SilentSnare SRS Scenario 2: Attacker poses as the local network gateway router, intercepting unencrypted outbound emails and modifying financial data.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsGatewaySpoofed(!isGatewaySpoofed)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
              isGatewaySpoofed
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-md shadow-rose-900/20'
                : 'glass-pill text-slate-400'
            }`}
          >
            {isGatewaySpoofed ? 'Gateway Spoofing: ACTIVE' : 'Gateway Spoofing: DISABLED'}
          </button>

          <button
            onClick={() => setIsTlsActive(!isTlsActive)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 active:scale-95 ${
              isTlsActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                : 'bg-amber-950/80 text-amber-300 border-amber-500'
            }`}
          >
            {isTlsActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isTlsActive ? 'STARTTLS Enforced' : 'Plaintext Port 25'}</span>
          </button>
        </div>
      </div>

      {/* 3-Stage Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage 1: Victim Outbound */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">Victim Email Client</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">192.168.1.10</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sender / Recipient:</label>
              <div className="space-y-1.5 mt-1 font-mono text-xs">
                <input
                  type="text"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Body:</label>
              <textarea
                rows={4}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none resize-none font-sans"
              />
            </div>

            <button
              onClick={handleSendOutboundEmail}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Outbound Email (Route via Gateway)</span>
            </button>
          </div>
        </div>

        {/* Stage 2: Spoofed Gateway */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-rose-300">Spoofed Gateway (Router Tap)</h3>
            </div>
            <span className="text-[9px] font-mono text-rose-400 font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800">
              {isGatewaySpoofed ? 'POISONED GATEWAY' : 'NORMAL ROUTER'}
            </span>
          </div>

          {capturedPacket ? (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Captured SMTP Payload:</span>
                <div className="mt-1 p-3 rounded-2xl bg-black/50 border border-white/10 text-[11px] text-rose-300 break-all max-h-24 overflow-y-auto shadow-inner">
                  {capturedPacket.rawPayload}
                </div>
              </div>

              {!isTlsActive && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Injected Wire Details:</label>
                  <textarea
                    rows={3}
                    value={modifiedContent}
                    onChange={(e) => setModifiedContent(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-black/50 border border-rose-900/60 text-[11px] text-rose-200 focus:outline-none resize-none font-sans"
                  />
                </div>
              )}

              <button
                onClick={handleForwardAlteredEmail}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Forward to Destination ({isTlsActive ? 'Forward TLS Payload' : 'Inject Altered Wire Instructions'})</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-sans">
              Send an email to inspect packets passing through the spoofed gateway.
            </div>
          )}
        </div>

        {/* Stage 3: External Vendor Recipient */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">External Mail Server / Recipient</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">WAN Target</span>
          </div>

          <div className="space-y-3">
            {finalDelivery ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border text-xs ${
                  finalDelivery.isCompromised
                    ? 'bg-rose-950/40 border-rose-700 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-700 text-emerald-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    {finalDelivery.isCompromised ? (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        FINANCIAL FRAUD COMPLETED (UNENCRYPTED)
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        DELIVERY SECURED (TLS PROTECTED)
                      </>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mb-2">
                    Delivered to: {finalDelivery.recipient}
                  </div>
                  <p className="font-sans text-xs text-slate-200 leading-relaxed bg-black/60 p-3 rounded-xl border border-white/10 shadow-inner">
                    {finalDelivery.content}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 font-sans border border-dashed border-white/10 rounded-2xl bg-black/20">
                Awaiting forwarded email from gateway...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
