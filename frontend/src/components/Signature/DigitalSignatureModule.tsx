import React, { useState } from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { SimulationControls } from '../Common/SimulationControls';
import { signMessage, verifySignature, computeSHA256 } from '../../cryptoEngine';
import { FileSignature, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DigitalSignatureModule: React.FC = () => {
  const { getKeyForOwner, addAuditLog } = useKeyVault();

  const [sender] = useState<string>('Alice');
  const [messageText, setMessageText] = useState<string>('TRANSFER AUTHORIZATION: Transfer 5,000 USD to Account #984210.');

  const [hashHex, setHashHex] = useState<string>('');
  const [signatureHex, setSignatureHex] = useState<string>('');
  const [isSigned, setIsSigned] = useState<boolean>(false);

  // Mid-Transit Tampering Controls
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperedText, setTamperedText] = useState<string>('TRANSFER AUTHORIZATION: Transfer 500,000 USD to Attacker Account #666.');
  const [verificationResult, setVerificationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const senderKey = getKeyForOwner(sender, 'RSA-PSS');

  const handleCreateSignature = async () => {
    if (!senderKey) {
      alert(`No RSA-PSS key found for ${sender}`);
      return;
    }

    const { hashHex: h, signatureHex: sig } = await signMessage(messageText, senderKey.privateKeyPem);

    setHashHex(h);
    setSignatureHex(sig);
    setIsSigned(true);
    setVerificationResult('idle');

    addAuditLog({
      module: 'signature',
      severity: 'info',
      title: 'Digital Signature Generated',
      details: `${sender} signed SHA-256 hash digest using Private Key. Hash: ${h.slice(0, 16)}...`,
    });
  };

  const handleVerifySignature = async () => {
    if (!senderKey || !isSigned) return;

    const payloadToVerify = isTampered ? tamperedText : messageText;
    const currentHash = await computeSHA256(payloadToVerify);

    const isValid = await verifySignature(payloadToVerify, signatureHex, senderKey.publicKeyPem);

    if (isValid && !isTampered) {
      setVerificationResult('valid');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

      addAuditLog({
        module: 'signature',
        severity: 'success',
        title: 'Signature Verification PASSED',
        details: `Integrity confirmed. Message hash matches signed hash. Authentic sender: ${sender}. Non-repudiation verified!`,
      });
    } else {
      setVerificationResult('invalid');
      addAuditLog({
        module: 'signature',
        severity: 'error',
        title: 'Signature Verification FAILED',
        details: `CRITICAL ALARM: Message tampering detected! Original hash (${hashHex.slice(0, 10)}) does not match tampered digest (${currentHash.slice(0, 10)}).`,
      });
    }
  };

  const handleReset = () => {
    setHashHex('');
    setSignatureHex('');
    setIsSigned(false);
    setIsTampered(false);
    setVerificationResult('idle');
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Digital Signature & Integrity Verification</h2>
              <span className="text-xs text-purple-400 font-mono">SHA-256 Digest + RSA-PSS Non-Repudiation Architecture</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Sender hashes message with SHA-256 and encrypts hash with Private Key. Recipient decrypts signature hash with Sender's Public Key to prove message integrity and authenticity.
          </p>
        </div>
      </div>

      {/* Simulation Controls */}
      <SimulationControls onReset={handleReset} />

      {/* Signature & Verification Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sender Studio: Sign Message */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <h3 className="font-bold text-slate-100 text-sm">Sender Studio ({sender})</h3>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              Private Key Signing
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Message Content to Sign</label>
              <textarea
                rows={3}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                disabled={isSigned}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-sans text-xs focus:outline-none focus:border-purple-500 leading-relaxed disabled:opacity-70"
              />
            </div>

            {/* Hash Digest & Signature Details */}
            {isSigned && (
              <div className="space-y-2 animate-fadeIn font-mono">
                <div>
                  <label className="text-slate-400 text-[11px] block">1. SHA-256 Message Digest (Hash)</label>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 text-[11px] break-all">
                    {hashHex}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block">2. Digital Signature (Encrypted Hash with {sender}'s Private Key)</label>
                  <div className="p-2 rounded-lg bg-slate-950 border border-purple-900 text-purple-300 text-[11px] break-all h-20 overflow-y-auto">
                    {signatureHex}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateSignature}
              disabled={isSigned}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 transition-all"
            >
              <FileSignature className="w-4 h-4" />
              <span>{isSigned ? 'Message Signed' : `Sign Message with ${sender}'s Private Key`}</span>
            </button>
          </div>
        </div>

        {/* Verification Studio & Interactive Tampering Demo */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">Verifier Studio (Public Key Verification)</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Integrity & Non-Repudiation
              </span>
            </div>

            <div className="space-y-4 mt-3 text-xs">
              
              {/* Interactive Tamper Switch */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300">Simulate Mid-Transit Tampering</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTampered}
                      onChange={e => {
                        setIsTampered(e.target.checked);
                        setVerificationResult('idle');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {isTampered ? (
                  <div>
                    <label className="text-rose-400 text-[11px] font-semibold block mb-1">
                      Attacker Altered Payload (Tampered)
                    </label>
                    <textarea
                      rows={2}
                      value={tamperedText}
                      onChange={e => setTamperedText(e.target.value)}
                      className="w-full bg-rose-950/40 border border-rose-800 rounded-lg p-2 text-rose-200 font-sans text-xs focus:outline-none"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Toggle switch above to simulate a Man-in-the-Middle (MITM) attack altering the text payload before recipient receives it.
                  </p>
                )}
              </div>

              {/* Verification Output Card */}
              {verificationResult !== 'idle' && (
                <div
                  className={`p-4 rounded-xl border flex items-center space-x-3 transition-all animate-fadeIn ${
                    verificationResult === 'valid'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                >
                  {verificationResult === 'valid' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {verificationResult === 'valid' ? 'Signature Verified (PASSED)' : 'Signature Rejected (TAMPERING DETECTED)'}
                    </div>
                    <div className="text-xs mt-0.5">
                      {verificationResult === 'valid'
                        ? `Message hash matches signature. Originated genuinely from ${sender}. Non-repudiation guaranteed.`
                        : 'Message digest mismatch! Payload modified in transit or signed with unauthorized key.'}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <button
            onClick={handleVerifySignature}
            disabled={!isSigned}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Digital Signature with {sender}'s Public Key</span>
          </button>
        </div>

      </div>
    </div>
  );
};
