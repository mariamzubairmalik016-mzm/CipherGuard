'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Key, 
  X, 
  Plus, 
  Copy, 
  Check, 
  Lock, 
  Trash2, 
  Calculator, 
  Sparkles,
  Shield
} from 'lucide-react';
import { KeyPairData } from '@/lib/types';

export const KeyVaultModal: React.FC = () => {
  const { keys, isVaultOpen, setIsVaultOpen, generateNewKeyPair } = useKeyVault();

  const [newOwner, setNewOwner] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('Custom Participant');
  const [newType, setNewType] = useState<KeyPairData['type']>('RSA-OAEP');
  const [selectedKey, setSelectedKey] = useState<KeyPairData | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isVaultOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.trim()) return;

    setIsGenerating(true);
    try {
      const created = await generateNewKeyPair(newOwner.trim(), newRole.trim(), newType, 2048);
      setSelectedKey(created);
      setNewOwner('');
    } catch (err) {
      alert('Key generation failed: ' + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPem = (pem: string, id: string) => {
    navigator.clipboard.writeText(pem);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl glass-panel border border-white/15 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Asymmetric Cryptographic Key Vault
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold">
                  {keys.length} Active Keypairs
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Secure Key Generation, PEM Export, and RSA Mathematical Parameter Explorer.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVaultOpen(false)}
            className="p-2.5 rounded-2xl glass-pill hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Create New Key Form */}
          <form onSubmit={handleGenerate} className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-3 shadow-inner">
            <div className="flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="Participant Name (e.g. Charlie, Treasury)"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                placeholder="Role / Purpose"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="min-w-[140px]">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as KeyPairData['type'])}
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="RSA-OAEP">RSA-OAEP (Encryption)</option>
                <option value="RSA-PSS">RSA-PSS (Signing)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isGenerating || !newOwner.trim()}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>{isGenerating ? 'Generating...' : 'Generate Keypair'}</span>
            </button>
          </form>

          {/* Keys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keys.map((k) => (
              <div
                key={k.id}
                onClick={() => setSelectedKey(k)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedKey?.id === k.id
                    ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-amber-400">
                      {k.owner.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{k.owner}</h4>
                      <span className="text-[10px] text-slate-400">{k.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 text-cyan-300 border border-white/10">
                    {k.type} • {k.keySize}-bit
                  </span>
                </div>

                {k.mathPrimes && (
                  <div className="mt-2.5 text-[10px] font-mono text-slate-400 flex items-center gap-2.5">
                    <span>p={k.mathPrimes.p}</span>
                    <span>q={k.mathPrimes.q}</span>
                    <span>n={k.mathPrimes.n}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Key Details */}
          {selectedKey && (
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4 shadow-inner animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Key Details: {selectedKey.owner} ({selectedKey.type})
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {selectedKey.id}
                </span>
              </div>

              {selectedKey.mathPrimes && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs space-y-1.5">
                  <div className="text-amber-400 font-bold text-[11px] mb-1">
                    RSA Mathematical Key Synthesis:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Prime p:</span> {selectedKey.mathPrimes.p}</div>
                    <div><span className="text-slate-500">Prime q:</span> {selectedKey.mathPrimes.q}</div>
                    <div><span className="text-slate-500">Modulus n:</span> {selectedKey.mathPrimes.n}</div>
                    <div><span className="text-slate-500">Totient φ(n):</span> {selectedKey.mathPrimes.phi}</div>
                    <div><span className="text-slate-500">Public Exp e:</span> {selectedKey.mathPrimes.e}</div>
                    <div><span className="text-slate-500">Private Exp d:</span> {selectedKey.mathPrimes.d}</div>
                  </div>
                </div>
              )}

              {/* PEM Code Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {/* Public Key */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-sans">Public Key PEM (SPKI):</span>
                    <button
                      onClick={() => handleCopyPem(selectedKey.publicKeyPem, 'pub')}
                      className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-300"
                    >
                      {copiedKeyId === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 overflow-x-auto max-h-28 whitespace-pre leading-tight">
                    {selectedKey.publicKeyPem}
                  </div>
                </div>

                {/* Private Key */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase font-sans">Private Key PEM (PKCS8):</span>
                    <button
                      onClick={() => handleCopyPem(selectedKey.privateKeyPem, 'priv')}
                      className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-300"
                    >
                      {copiedKeyId === 'priv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 overflow-x-auto max-h-28 whitespace-pre leading-tight">
                    {selectedKey.privateKeyPem}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
