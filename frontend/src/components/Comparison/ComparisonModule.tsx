import React, { useState } from 'react';
import type { MethodComparisonMetric } from '../../types';
import { BarChart2, ShieldCheck, Lock, FileSignature, Award, Compass } from 'lucide-react';

export const ComparisonModule: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<'privacy' | 'tamper' | 'both'>('privacy');

  const metrics: MethodComparisonMetric[] = [
    {
      feature: 'Primary Security Objective',
      vpnEncryption: { score: 10, detail: 'Data Confidentiality & Session Privacy (Encrypted Tunnel)' },
      digitalSignature: { score: 10, detail: 'Data Integrity, Authenticity & Non-Repudiation (No Privacy)' },
    },
    {
      feature: 'Encryption Scheme',
      vpnEncryption: { score: 9, detail: 'Hybrid (Asymmetric PKE Handshake + Symmetric AES Tunnel)' },
      digitalSignature: { score: 8, detail: 'Asymmetric PKE (Private Key Sign, Public Key Verify)' },
    },
    {
      feature: 'Performance Overhead',
      vpnEncryption: { score: 9, detail: 'Very Low after Handshake (Gigabit AES Hardware Acceleration)' },
      digitalSignature: { score: 7, detail: 'Low to Moderate (SHA-256 Hashing + RSA Signature check)' },
    },
    {
      feature: 'Message Hiding (Confidentiality)',
      vpnEncryption: { score: 10, detail: 'Complete payload obfuscation (Unreadable to Eavesdroppers)' },
      digitalSignature: { score: 2, detail: 'Plaintext remains readable; Signature only verifies origin' },
    },
    {
      feature: 'Non-Repudiation (Sender Proof)',
      vpnEncryption: { score: 5, detail: 'Session-based authentication (Client/Server handshake)' },
      digitalSignature: { score: 10, detail: 'Absolute legal proof; Sender cannot deny signing' },
    },
    {
      feature: 'Implementation Complexity',
      vpnEncryption: { score: 7, detail: 'Requires Gateway / TLS Protocol State Machine' },
      digitalSignature: { score: 9, detail: 'Lightweight; can be attached to any message file' },
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Comparison & Analysis Module</h2>
              <span className="text-xs text-amber-400 font-mono">VPN Tunneling vs Digital Signatures Strategic Matrix</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Evaluates the relative strengths, performance overhead, confidentiality, and authenticity guarantees of VPN Tunnel Encryption versus Digital Signature mechanisms.
          </p>
        </div>
      </div>

      {/* Interactive Recommendation Finder */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
          <Compass className="w-5 h-5" />
          <span>Interactive Security Goal Recommendation Advisor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedGoal('privacy')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedGoal === 'privacy'
                ? 'bg-blue-950/80 border-blue-500 text-white ring-1 ring-blue-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-5 h-5 text-blue-400 mb-2" />
            <div className="font-bold text-xs text-slate-200">Goal: Confidentiality & Privacy</div>
            <div className="text-[11px] text-slate-400 mt-1">Protect stream data from eavesdroppers on public networks</div>
          </button>

          <button
            onClick={() => setSelectedGoal('tamper')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedGoal === 'tamper'
                ? 'bg-purple-950/80 border-purple-500 text-white ring-1 ring-purple-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSignature className="w-5 h-5 text-purple-400 mb-2" />
            <div className="font-bold text-xs text-slate-200">Goal: Integrity & Non-Repudiation</div>
            <div className="text-[11px] text-slate-400 mt-1">Prove document origin & detect unauthorized alterations</div>
          </button>

          <button
            onClick={() => setSelectedGoal('both')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedGoal === 'both'
                ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-xs text-slate-200">Goal: Comprehensive Security</div>
            <div className="text-[11px] text-slate-400 mt-1">Combine VPN encrypted tunnel with digital signatures</div>
          </button>
        </div>

        {/* Advisor Output Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-400">
            <Award className="w-4 h-4" />
            <span>Optimal Cryptographic Architecture Recommendation:</span>
          </div>
          {selectedGoal === 'privacy' && (
            <p className="text-slate-300">
              <strong className="text-blue-400">Choose VPN Encryption (TLS/IPsec):</strong> Best suited for real-time web traffic, remote access, and network tunneling. Uses PKE only for initial session key setup, maximizing symmetric throughput (AES-256).
            </p>
          )}
          {selectedGoal === 'tamper' && (
            <p className="text-slate-300">
              <strong className="text-purple-400">Choose Digital Signatures (RSA-PSS/PGP):</strong> Best suited for legal contracts, software updates, and financial wire transfers where proof of identity and tamper detection are paramount.
            </p>
          )}
          {selectedGoal === 'both' && (
            <p className="text-slate-300">
              <strong className="text-emerald-400">Choose Combined Hybrid Model (VPN + Signatures):</strong> Best suited for zero-trust enterprise security. Tunnel provides transport confidentiality while digital signatures enforce non-repudiation per payload.
            </p>
          )}
        </div>
      </div>

      {/* Comparison Metrics Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Side-by-Side Architectural Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 bg-slate-950">
                <th className="p-3">Feature / Metric</th>
                <th className="p-3 text-blue-400">VPN Encryption (TLS/IPsec)</th>
                <th className="p-3 text-purple-400">Digital Signatures (PKE/SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-200">{m.feature}</td>
                  <td className="p-3 text-slate-300">
                    <div className="font-semibold text-blue-300">{m.vpnEncryption.detail}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${m.vpnEncryption.score * 10}%` }} />
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">
                    <div className="font-semibold text-purple-300">{m.digitalSignature.detail}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${m.digitalSignature.score * 10}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
