'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Mail, 
  Lock, 
  Unlock, 
  Send, 
  CheckCircle, 
  ShieldAlert, 
  Calculator, 
  Sparkles, 
  Key, 
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { encryptWithRsaOaep, decryptWithRsaOaep } from '@/lib/cryptoEngine';

export const SecureEmailModule: React.FC = () => {
  const { getKeyByOwner, getCryptoKeyByOwner, addAuditLog } = useKeyVault();

  const [sender] = useState<string>('Alice');
  const [recipient] = useState<string>('Bob');
  const [subject, setSubject] = useState<string>('CONFIDENTIAL: Quantum Defense Protocol Specification');
  const [body, setBody] = useState<string>(
    'Dear Bob, the updated cryptographic handshake keys have been generated using RSA-2048. Please review the attached parameters and ensure strict confidentiality.'
  );

  const [encryptedBody, setEncryptedBody] = useState<string>('');
  const [decryptedBody, setDecryptedBody] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showMath, setShowMath] = useState<boolean>(false);
  const [attackerInterceptAttempt, setAttackerInterceptAttempt] = useState<boolean>(false);
  const [copiedCipher, setCopiedCipher] = useState<boolean>(false);

  const bobKey = getKeyByOwner('Bob', 'RSA-OAEP');
  const bobCryptoKey = getCryptoKeyByOwner('Bob');

  const handleEncryptAndSend = async () => {
    if (!bobCryptoKey) {
      alert('Recipient Bob does not have an active RSA-OAEP key. Please generate one in the Key Vault.');
      return;
    }

    setIsProcessing(true);
    setStep(1);

    try {
      const ciphertext = await encryptWithRsaOaep(bobCryptoKey.public, body);
      setEncryptedBody(ciphertext);
      setDecryptedBody('');
      setStep(2);

      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `email_${Date.now()}`,
          sender,
          recipient,
          subject,
          body,
          encryptedBody: ciphertext,
          status: 'transmitted',
          isEncrypted: true,
          timestamp: new Date().toISOString(),
        }),
      });

      await addAuditLog(
        'SecureEmail',
        'SUCCESS',
        'Email Encrypted & Transmitted via PKE',
        `Alice encrypted email using Bob's RSA-2048 Public Key (Ciphertext length: ${ciphertext.length} chars).`
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Encryption failed:', err);
      alert('Encryption failed: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBobDecrypt = async () => {
    if (!bobCryptoKey || !encryptedBody) return;

    setIsProcessing(true);
    try {
      const plaintext = await decryptWithRsaOaep(bobCryptoKey.private, encryptedBody);
      setDecryptedBody(plaintext);
      setStep(3);

      await addAuditLog(
        'SecureEmail',
        'SUCCESS',
        'Email Decrypted by Intended Recipient',
        `Bob successfully decrypted email using his RSA-2048 Private Key. Message integrity verified.`
      );
    } catch (err) {
      console.error('Decryption failed:', err);
      alert('Decryption failed: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCipher = () => {
    navigator.clipboard.writeText(encryptedBody);
    setCopiedCipher(true);
    setTimeout(() => setCopiedCipher(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Secure Email Encryption Simulation (PKE)
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                RSA-OAEP 2048
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Asymmetric Model: Sender encrypts with Recipient’s Public Key; only Recipient’s Private Key can unlock the ciphertext envelope.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMath(!showMath)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-pill hover:border-emerald-500/50 text-xs font-bold text-emerald-400 transition-all active:scale-95 shadow-sm"
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>{showMath ? 'Hide RSA Prime Math' : 'Inspect RSA Math (p, q, n, e, d)'}</span>
        </button>
      </div>

      {/* RSA Prime Math Explorer */}
      {showMath && bobKey?.mathPrimes && (
        <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Under the Hood: RSA Mathematical Key Synthesis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Number Theory Decomposition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
              <span className="text-zinc-400 text-[11px] font-sans">1. Prime Number Factorization:</span>
              <div className="text-emerald-300 font-bold">p = {bobKey.mathPrimes.p}</div>
              <div className="text-emerald-300 font-bold">q = {bobKey.mathPrimes.q}</div>
              <p className="text-[10px] text-zinc-500 font-sans mt-1">Two secret primes generated for modulus computation.</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
              <span className="text-zinc-400 text-[11px] font-sans">2. Modulus & Euler&apos;s Totient:</span>
              <div className="text-teal-300 font-bold">n = p × q = {bobKey.mathPrimes.n}</div>
              <div className="text-teal-300 font-bold">φ(n) = (p-1)(q-1) = {bobKey.mathPrimes.phi}</div>
              <p className="text-[10px] text-zinc-500 font-sans mt-1">Public modulus n; factoring n into p & q is computationally infeasible.</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
              <span className="text-zinc-400 text-[11px] font-sans">3. Public & Private Exponents:</span>
              <div className="text-amber-300 font-bold">e (Public Exponent) = {bobKey.mathPrimes.e}</div>
              <div className="text-rose-400 font-bold">d (Private Key) = {bobKey.mathPrimes.d}</div>
              <p className="text-[10px] text-zinc-500 font-sans mt-1">Private key d is the modular inverse: d ≡ e⁻¹ (mod φ(n)).</p>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Interactive Spatial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alice (Sender) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                A
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Alice (Sender)</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Originating Client Node</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
              Ready
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target Recipient:</label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10 mt-1">
                <span className="text-xs font-mono text-emerald-300 font-semibold">Bob (bob@cipherguard.io)</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Key className="w-3 h-3" /> Linked
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Plaintext Message Body:</label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none transition-colors font-sans"
              />
            </div>

            <button
              onClick={handleEncryptAndSend}
              disabled={isProcessing || !body.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Encrypt with Bob&apos;s Public Key & Send</span>
            </button>
          </div>
        </div>

        {/* Middle Column: Public Transit & Eavesdropping Test */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-purple-950 border border-purple-700/50 text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Public Transit Pipeline</h3>
              </div>
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                step >= 2 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-white/10 text-zinc-400'
              }`}>
                {step >= 2 ? 'ENCRYPTED ENVELOPE' : 'IDLE'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  RSA Ciphertext Payload (Base64):
                </span>
                {encryptedBody && (
                  <button onClick={handleCopyCipher} className="text-zinc-400 hover:text-white p-1">
                    {copiedCipher ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              {encryptedBody ? (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300 break-all max-h-40 overflow-y-auto scrollbar-thin shadow-inner">
                  {encryptedBody}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  Compose message on the left and click Encrypt to watch ciphertext generate.
                </div>
              )}
            </div>
          </div>

          {/* Attacker Intercept Demonstration */}
          {encryptedBody && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 shadow-lg shadow-rose-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  MITM Eavesdropper Test
                </span>
                <button
                  onClick={() => setAttackerInterceptAttempt(!attackerInterceptAttempt)}
                  className="text-[10px] px-2.5 py-1 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold border border-rose-700 transition-colors"
                >
                  {attackerInterceptAttempt ? 'Hide Intercept' : 'Attempt Interception'}
                </button>
              </div>

              {attackerInterceptAttempt && (
                <div className="text-[11px] text-zinc-300 space-y-2 animate-fadeIn">
                  <p className="text-zinc-400 text-[10px]">
                    Attacker intercepted the packet in transit, but lacks Bob&apos;s Private Key:
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/70 font-mono text-[10px] text-rose-400 border border-rose-900/40">
                    [ERROR: RSA_DECRYPT_FAILED] Mathematical infeasibility: requires factorizing modulus n ({bobKey?.mathPrimes?.n}) into private exponent d.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Bob (Recipient) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                B
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Bob (Recipient)</h3>
                <span className="text-[10px] text-teal-400 font-mono">Private Key Holder</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
              Inbox
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status:</label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10 mt-1 text-xs">
                <span className="text-zinc-300 font-medium">
                  {decryptedBody ? 'Message Decrypted & Verified' : (encryptedBody ? 'Encrypted Email Received' : 'Waiting for transmission...')}
                </span>
                {decryptedBody && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            <button
              onClick={handleBobDecrypt}
              disabled={!encryptedBody || isProcessing || Boolean(decryptedBody)}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4 text-slate-950" />
              <span>Unlock & Decrypt with Bob&apos;s Private Key</span>
            </button>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Decrypted Plaintext:</label>
              {decryptedBody ? (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/80 text-xs text-emerald-200 font-sans mt-1 space-y-1.5 shadow-inner">
                  <div className="font-bold text-emerald-400">Subject: {subject}</div>
                  <p className="leading-relaxed">{decryptedBody}</p>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-zinc-500 mt-1">
                  Decrypted content will appear here after Bob unlocks the envelope.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
