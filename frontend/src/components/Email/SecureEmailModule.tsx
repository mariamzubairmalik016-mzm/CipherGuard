import React, { useState } from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { SimulationControls } from '../Common/SimulationControls';
import { encryptRSA, decryptRSA } from '../../cryptoEngine';
import { Mail, Lock, Unlock, Key, Calculator, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SecureEmailModule: React.FC = () => {
  const { getKeyForOwner, addAuditLog } = useKeyVault();

  const [sender, setSender] = useState<string>('Alice');
  const [recipient, setRecipient] = useState<string>('Bob');
  const [subject, setSubject] = useState<string>('CLASSIFIED: Project CipherGuard Specs');
  const [body, setBody] = useState<string>('The Sentinel of Secrets algorithm requires RSA-2048 encryption for all outbound messages.');

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [encryptedPayload, setEncryptedPayload] = useState<string>('');
  const [decryptedBody, setDecryptedBody] = useState<string>('');
  const [showMathDrawer, setShowMathDrawer] = useState<boolean>(false);

  const recipientKey = getKeyForOwner(recipient, 'RSA-OAEP');

  const steps = [
    { title: 'Compose Message', desc: 'Input subject & body for transmission' },
    { title: 'Asymmetric Encryption', desc: 'Encrypt plaintext using Recipient Public Key' },
    { title: 'Secure Envelope Transmission', desc: 'Transfer encrypted ciphertext over untrusted channel' },
    { title: 'Recipient Decryption', desc: 'Unlock payload using Recipient Private Key' },
  ];

  const handleStartSimulation = async () => {
    if (!recipientKey) {
      alert(`No public key found for ${recipient}`);
      return;
    }

    setIsProcessing(true);
    setActiveStep(1);

    addAuditLog({
      module: 'email',
      severity: 'info',
      title: 'Email Encryption Initiated',
      details: `${sender} encrypting email for ${recipient} using ${recipientKey.owner}'s RSA-2048 Public Key.`,
    });

    try {
      // Step 1 -> Step 2: Encrypt body using Recipient's Public Key
      const ciphertext = await encryptRSA(body, recipientKey.publicKeyPem);
      setEncryptedPayload(ciphertext);

      setTimeout(() => {
        setActiveStep(2);
        addAuditLog({
          module: 'email',
          severity: 'info',
          title: 'Encrypted Envelope Transmitted',
          details: `Ciphertext packet sent to ${recipient}. Payload size: ${ciphertext.length} chars (Base64).`,
        });
      }, 1200);

      setTimeout(async () => {
        setActiveStep(3);
        // Decrypt using Recipient's Private Key
        const originalText = await decryptRSA(ciphertext, recipientKey.privateKeyPem);
        setDecryptedBody(originalText);
        setIsProcessing(false);

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });

        addAuditLog({
          module: 'email',
          severity: 'success',
          title: 'Email Decrypted Successfully',
          details: `${recipient} successfully decrypted message using their Private Key. Confidentiality preserved!`,
        });
      }, 2600);
    } catch (err) {
      setIsProcessing(false);
      addAuditLog({
        module: 'email',
        severity: 'error',
        title: 'Decryption Failed',
        details: String(err),
      });
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setEncryptedPayload('');
    setDecryptedBody('');
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Secure Email Encryption Simulation</h2>
              <span className="text-xs text-cyan-400 font-mono">Public Key Encryption (PKE) Asymmetric Model</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Demonstrates confidentiality in message exchange. Sender encrypts using recipient's public key; only recipient possessing matching private key can decrypt.
          </p>
        </div>

        <button
          onClick={() => setShowMathDrawer(!showMathDrawer)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-md"
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>{showMathDrawer ? 'Hide RSA Math' : 'Inspect RSA Math Formula'}</span>
        </button>
      </div>

      {/* Math Inspection Drawer */}
      {showMathDrawer && recipientKey?.mathPrimes && (
        <div className="bg-slate-950 border border-cyan-900/60 p-5 rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>RSA Mathematical Cryptography Inspection ({recipient}'s Key Pair)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Aptech TechWiz 6 Educational Core</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="text-cyan-400 font-bold">1. Public Key Pair (n, e)</div>
              <div className="text-slate-300">Modulus (n = p ⋅ q): <span className="text-emerald-400">{recipientKey.mathPrimes.n}</span></div>
              <div className="text-slate-300">Public Exponent (e): <span className="text-cyan-400">{recipientKey.mathPrimes.e}</span></div>
              <div className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-800">
                Formula: <span className="text-amber-300">c = mᵉ (mod n)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="text-rose-400 font-bold">2. Private Key Pair (n, d)</div>
              <div className="text-slate-300">Modulus (n): <span className="text-emerald-400">{recipientKey.mathPrimes.n}</span></div>
              <div className="text-slate-300">Private Exponent (d): <span className="text-rose-400">{recipientKey.mathPrimes.d}</span></div>
              <div className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-800">
                Formula: <span className="text-emerald-300">m = cᵈ (mod n)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((st, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all ${
              activeStep === idx
                ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                : activeStep > idx
                ? 'bg-slate-900 border-emerald-800 text-slate-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono font-bold">STEP 0{idx + 1}</span>
              {activeStep > idx && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="font-semibold text-xs text-slate-200">{st.title}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Simulation Controls */}
      <SimulationControls onReset={handleReset} />

      {/* Main Workspace: Email Client Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Email Composer (Alice - Sender) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <h3 className="font-bold text-slate-100 text-sm">Sender Studio (Alice)</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                PKE Outbound
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">From Sender</label>
                  <select
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Alice">Alice (Sender Identity)</option>
                    <option value="Bob">Bob</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">To Recipient</label>
                  <select
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Bob">Bob (Recipient Identity)</option>
                    <option value="Alice">Alice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Message Body (Plaintext)</label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Encryption Key Indicator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Target Encryption Key:</span>
                </div>
                <span className="font-mono text-cyan-300 font-bold">{recipient}'s Public Key (RSA-2048)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/40 transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Encrypting & Transmitting...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Encrypt & Send Secure Email</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Transmission & Recipient Inbox (Bob - Recipient) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">Recipient Inbox ({recipient})</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                PKE Inbound
              </span>
            </div>

            {/* Ciphertext Packet Preview */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1 flex items-center justify-between">
                  <span>Encrypted Payload (Untrusted Transmission Channel)</span>
                  {activeStep >= 2 && <span className="text-emerald-400 font-mono text-[10px]">Encrypted with RSA-OAEP</span>}
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400 break-all h-28 overflow-y-auto">
                  {encryptedPayload ? (
                    encryptedPayload
                  ) : (
                    <span className="text-slate-600 italic">No encrypted envelope transmitted yet. Click 'Encrypt & Send' to simulate.</span>
                  )}
                </div>
              </div>

              {/* Decrypted Payload Result */}
              <div>
                <label className="text-slate-400 font-semibold block mb-1 flex items-center justify-between">
                  <span>Decrypted Plaintext Message</span>
                  {activeStep === 3 && (
                    <span className="text-emerald-400 font-mono text-[10px] flex items-center space-x-1">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked with Private Key</span>
                    </span>
                  )}
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans text-slate-200 h-28 overflow-y-auto leading-relaxed">
                  {decryptedBody ? (
                    <div className="space-y-1">
                      <div className="font-bold text-cyan-300 pb-1 border-b border-slate-800">Subject: {subject}</div>
                      <div>{decryptedBody}</div>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic">Message will be decrypted using {recipient}'s Private Key when payload arrives.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Vault Reminder */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Decryption Key:</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{recipient}'s Private Key (Secret)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
