import React, { useState } from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { X, Key, Copy, Check, Plus, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const KeyVaultModal: React.FC = () => {
  const { isKeyVaultOpen, setIsKeyVaultOpen, keys, generateNewKeyPairForOwner } = useKeyVault();
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [newOwnerName, setNewOwnerName] = useState<string>('Charlie');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isKeyVaultOpen) return null;

  const currentKey = keys.find(k => k.id === selectedKeyId) || keys[0];

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateCustomKey = async () => {
    if (!newOwnerName.trim()) return;
    setIsGenerating(true);
    await generateNewKeyPairForOwner(newOwnerName, 'sender', 'RSA-OAEP');
    setIsGenerating(false);
    setNewOwnerName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Cryptographic Key Vault</h2>
              <p className="text-xs text-slate-400">Secure simulated storage for RSA 2048/4096-bit public & private key pairs</p>
            </div>
          </div>
          <button
            onClick={() => setIsKeyVaultOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          
          {/* Key List Sidebar */}
          <div className="border-r border-slate-800 bg-slate-950/50 p-4 overflow-y-auto space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stored Key Pairs</h3>
            {keys.map(key => {
              const isSelected = currentKey?.id === key.id;
              return (
                <button
                  key={key.id}
                  onClick={() => {
                    setSelectedKeyId(key.id);
                    setShowPrivateKey(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/50 shadow-md text-white'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-cyan-300">{key.owner}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                      {key.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{key.keySize} bits</span>
                    <span className="capitalize text-slate-500">{key.role}</span>
                  </div>
                </button>
              );
            })}

            {/* Quick Generator Box */}
            <div className="pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Generate New Key Pair
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Identity (e.g. Charlie)"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleGenerateCustomKey}
                  disabled={isGenerating || !newOwnerName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Detail View */}
          <div className="md:col-span-2 p-6 overflow-y-auto space-y-6">
            {currentKey && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-slate-100">{currentKey.owner}'s Key Certificate</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {currentKey.id} • Created: {currentKey.createdAt}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs">
                    {currentKey.type} ({currentKey.keySize} bit)
                  </span>
                </div>

                {/* Educational RSA Primes breakdown if available */}
                {currentKey.mathPrimes && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Educational RSA Math Values</span>
                      <span className="text-[10px] text-slate-500 font-mono">e ⋅ d ≡ 1 (mod φ(n))</span>
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">p (prime)</div>
                        <div className="text-cyan-300 font-bold">{currentKey.mathPrimes.p}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">q (prime)</div>
                        <div className="text-cyan-300 font-bold">{currentKey.mathPrimes.q}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">n (modulus)</div>
                        <div className="text-emerald-400 font-bold">{currentKey.mathPrimes.n}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">φ(n)</div>
                        <div className="text-amber-400 font-bold">{currentKey.mathPrimes.phi}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">e (pub exp)</div>
                        <div className="text-cyan-400 font-bold">{currentKey.mathPrimes.e}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">d (priv exp)</div>
                        <div className="text-rose-400 font-bold">{currentKey.mathPrimes.d}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Public Key Pem */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Public Key (Shared openly)
                    </label>
                    <button
                      onClick={() => copyToClipboard(currentKey.publicKeyPem, 'public')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      {copiedField === 'public' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'public' ? 'Copied' : 'Copy PEM'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-32">
                    {currentKey.publicKeyPem}
                  </pre>
                </div>

                {/* Private Key Pem */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                        Private Key (Secret & Protected)
                      </label>
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {showPrivateKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {showPrivateKey && (
                      <button
                        onClick={() => copyToClipboard(currentKey.privateKeyPem, 'private')}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                      >
                        {copiedField === 'private' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'private' ? 'Copied' : 'Copy PEM'}</span>
                      </button>
                    )}
                  </div>
                  {showPrivateKey ? (
                    <pre className="p-3 rounded-xl bg-slate-950 border border-rose-900/50 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
                      {currentKey.privateKeyPem}
                    </pre>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                      •••••••• Private Key hidden for security. Click eyeball icon to reveal. ••••••••
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
