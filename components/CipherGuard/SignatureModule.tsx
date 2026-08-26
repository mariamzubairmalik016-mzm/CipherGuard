'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  PenTool, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateSha256, signWithRsaPss, verifyWithRsaPss } from '@/lib/cryptoEngine';

export const SignatureModule: React.FC = () => {
  const { getKeyByOwner, getCryptoKeyByOwner, addAuditLog } = useKeyVault();

  const [message, setMessage] = useState<string>(
    'AUTHORIZED TRANSFER: Transfer 5,000,000 USD to Account #9821-SECURE-TREASURY. Cryptographically Approved by Alice.'
  );
  const [tamperedMessage, setTamperedMessage] = useState<string>(
    'AUTHORIZED TRANSFER: Transfer 50,000,000 USD to Attacker Account #6666-SWISS-OFFSHORE. Cryptographically Approved by Alice.'
  );

  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [hashDigest, setHashDigest] = useState<string>('');
  const [signatureHex, setSignatureHex] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<'IDLE' | 'VALID' | 'TAMPERED_INVALID'>('IDLE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedSig, setCopiedSig] = useState<boolean>(false);

  const aliceKey = getKeyByOwner('Alice', 'RSA-PSS');
  const aliceCryptoKey = getCryptoKeyByOwner('Alice');

  const handleSignMessage = async () => {
    if (!aliceCryptoKey) {
      alert('Alice does not have an active RSA-PSS keypair in the Vault. Please generate one.');
      return;
    }

    setIsProcessing(true);
    try {
      const hash = await calculateSha256(message);
      setHashDigest(hash);

      const sig = await signWithRsaPss(aliceCryptoKey.private, message);
      setSignatureHex(sig);
      setVerificationResult('IDLE');

      await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `sig_${Date.now()}`,
          sender: 'Alice',
          messageText: message,
          hashDigestHex: hash,
          signatureHex: sig,
          isTampered: false,
          verificationStatus: 'PENDING',
          timestamp: new Date().toISOString(),
        }),
      });

      await addAuditLog(
        'DigitalSignature',
        'SUCCESS',
        'Message Signed with RSA-PSS',
        `Alice generated SHA-256 digest (${hash.substring(0, 16)}...) and signed with RSA-2048 private key.`
      );
    } catch (err) {
      console.error('Signing failed:', err);
      alert('Signing failed: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySignature = async () => {
    if (!aliceCryptoKey || !signatureHex) return;

    setIsProcessing(true);
    try {
      const targetMessageToVerify = isTampered ? tamperedMessage : message;
      const isValid = await verifyWithRsaPss(aliceCryptoKey.public, signatureHex, targetMessageToVerify);

      if (isValid) {
        setVerificationResult('VALID');
        await addAuditLog(
          'DigitalSignature',
          'SUCCESS',
          'Digital Signature Verification PASSED',
          `Verified sender authenticity and cryptographic integrity. Message was NOT altered.`
        );
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        setVerificationResult('TAMPERED_INVALID');
        await addAuditLog(
          'DigitalSignature',
          'CRITICAL',
          'Digital Signature Verification FAILED - Tampering Detected!',
          `Hash mismatch. The payload was altered mid-transit or private key was forged.`
        );
      }
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySignature = () => {
    navigator.clipboard.writeText(signatureHex);
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Digital Signature Creation & Tamper Verification
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                RSA-PSS + SHA-256
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Data Integrity, Authenticity & Non-Repudiation: Sender signs SHA-256 digest with Private Key; Verifier checks with Public Key.
            </p>
          </div>
        </div>

        {/* MITM Tampering Toggle Pill */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl glass-pill shadow-inner">
          <span className="text-xs font-semibold text-zinc-300">Simulate MITM Tampering:</span>
          <button
            onClick={() => {
              setIsTampered(!isTampered);
              setVerificationResult('IDLE');
            }}
            className="flex items-center space-x-1.5 transition-all"
          >
            {isTampered ? (
              <ToggleRight className="w-8 h-8 text-rose-500 transition-all transform scale-105" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-zinc-600 transition-all" />
            )}
            <span className={`text-xs font-mono font-bold ${isTampered ? 'text-rose-400' : 'text-zinc-500'}`}>
              {isTampered ? 'TAMPERED PAYLOAD' : 'AUTHENTIC'}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Interactive Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Alice Signs Message */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                A
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Alice (Signer)</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Private Key Holder</span>
              </div>
            </div>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
              Step 1: Sign
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Original Document Message:</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none font-sans"
              />
            </div>

            <button
              onClick={handleSignMessage}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4 text-slate-950" />}
              <span>Compute SHA-256 & Sign with Private Key</span>
            </button>
          </div>
        </div>

        {/* Step 2: Cryptographic Signature Artifact */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-purple-950 border border-purple-700/50 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Cryptographic Signature</h3>
            </div>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
              Step 2: Artifact
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">1. SHA-256 Digest:</span>
              <div className="mt-1 p-3 rounded-2xl bg-black/60 border border-white/10 text-[11px] text-emerald-300 break-all shadow-inner">
                {hashDigest || 'Hash will generate upon signing...'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">2. RSA-PSS Signature (Hex):</span>
                {signatureHex && (
                  <button onClick={handleCopySignature} className="text-zinc-400 hover:text-white p-1">
                    {copiedSig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <div className="mt-1 p-3 rounded-2xl bg-black/60 border border-white/10 text-[11px] text-teal-300 break-all max-h-32 overflow-y-auto scrollbar-thin shadow-inner">
                {signatureHex || 'Signature bytes will appear here...'}
              </div>
            </div>

            {isTampered && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] space-y-1 font-sans animate-pulse shadow-lg shadow-rose-950/30">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  MITM Tampering Simulation Active!
                </div>
                <p className="text-[10px] text-rose-400">
                  The attacker altered the transfer amount to $50,000,000 without Alice&apos;s private key.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Verifier Checks Signature */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                V
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Public Verifier</h3>
                <span className="text-[10px] text-teal-400 font-mono">Public Key Validation</span>
              </div>
            </div>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
              Step 3: Verify
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Received Message to Verify:</label>
              <div className={`p-3 rounded-2xl border mt-1 text-xs font-sans ${
                isTampered ? 'bg-rose-950/30 border-rose-800 text-rose-200' : 'bg-black/50 border-white/10 text-zinc-200'
              }`}>
                {isTampered ? tamperedMessage : message}
              </div>
            </div>

            <button
              onClick={handleVerifySignature}
              disabled={!signatureHex || isProcessing}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Verify Signature with Alice&apos;s Public Key</span>
            </button>

            {/* Verification Result Banner */}
            {verificationResult === 'VALID' && (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500 text-emerald-300 text-xs space-y-1.5 animate-fadeIn shadow-lg shadow-emerald-950/30">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  SIGNATURE VALID • AUTHENTICITY CONFIRMED
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  The SHA-256 digest matches Alice&apos;s RSA-PSS signature perfectly. The document has NOT been tampered with and guarantees non-repudiation.
                </p>
              </div>
            )}

            {verificationResult === 'TAMPERED_INVALID' && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs space-y-1.5 animate-fadeIn shadow-lg shadow-rose-950/40">
                <div className="font-bold flex items-center gap-1.5 text-rose-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  CRITICAL: TAMPERING DETECTED!
                </div>
                <p className="text-[11px] text-rose-300 leading-relaxed">
                  Signature verification FAILED! The message hash does not match Alice&apos;s signed digest. The content was altered in transit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
