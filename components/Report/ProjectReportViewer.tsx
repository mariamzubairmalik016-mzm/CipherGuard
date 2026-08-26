'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Presentation, 
  CheckCircle2, 
  Download, 
  ArrowLeft,
  Shield,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { useKeyVault } from '@/context/KeyVaultContext';

export const ProjectReportViewer: React.FC = () => {
  const { setActiveMode } = useKeyVault();
  const [activeTab, setActiveTab] = useState<'srs' | 'video' | 'slides'>('srs');

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setActiveMode('overview')}
            className="p-3 rounded-2xl glass-pill hover:border-emerald-500/50 text-zinc-300 hover:text-white transition-all active:scale-95"
            title="Back to Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Competition Project Report & Submission Dossier
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                TechWiz 6 Global
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Aptech TechWiz 6 • Category: Ethical Codebreaking • Themes: Sentinel of Secrets & SilentSnare
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {[
            { id: 'srs' as const, label: 'SRS Matrix', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'video' as const, label: 'Video Script (.mp4)', icon: <Video className="w-3.5 h-3.5" /> },
            { id: 'slides' as const, label: 'Slide Deck (PPT)', icon: <Presentation className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Pane */}
      {activeTab === 'srs' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="glass-panel rounded-3xl p-7 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              1. Executive Project Summary
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              <strong className="text-white">CipherGuard & SilentSnare</strong> is a full-stack Next.js 15 cyber-defense and attack-vector simulation system designed for the Aptech TechWiz 6 competition. The platform demonstrates how asymmetric cryptography (PKE) safeguards digital communications, while concurrently exposing the mechanics of Man-in-the-Middle (MITM) attacks and illustrating enterprise countermeasures.
            </p>
          </div>

          {/* Compliance Matrix Table */}
          <div className="glass-panel rounded-3xl p-7 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              2. SRS Functional Requirements Verification Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-mono">
                    <th className="py-3 px-4">SRS Requirement</th>
                    <th className="py-3 px-4">Theme / Scope</th>
                    <th className="py-3 px-4">Implementation Architecture</th>
                    <th className="py-3 px-4 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {[
                    {
                      req: '1.6 i: Secure Email Encryption',
                      theme: 'Sentinel of Secrets',
                      impl: 'Web Crypto RSA-OAEP 2048 encryption with recipient public key & prime explorer.',
                    },
                    {
                      req: '1.6 ii: VPN Handshake & Tunnel',
                      theme: 'Sentinel of Secrets',
                      impl: '5-step TLS 1.3 handshake deriving symmetric AES-256-GCM session key + hex viewer.',
                    },
                    {
                      req: '1.6 iii: Digital Signatures',
                      theme: 'Sentinel of Secrets',
                      impl: 'SHA-256 message digest + RSA-PSS signing & live MITM tampering detector.',
                    },
                    {
                      req: '1.6 v: CLI Tool Studio',
                      theme: 'Sentinel of Secrets',
                      impl: 'Interactive terminal running OpenSSL, GnuPG, and tshark/Wireshark recipes.',
                    },
                    {
                      req: '1.6 vii: Comparison Matrix',
                      theme: 'Sentinel of Secrets',
                      impl: 'Multi-metric decision evaluation of VPN vs Digital Signatures across 6 dimensions.',
                    },
                    {
                      req: '1.6 i/iii: Dual-Host ARP Poisoning',
                      theme: 'SilentSnare MITM',
                      impl: 'Host A <-> Attacker <-> Host B duplex ARP spoofing with intercept & drop controls.',
                    },
                    {
                      req: '1.6 iv: Gateway Spoofing',
                      theme: 'SilentSnare MITM',
                      impl: 'Router tap intercepting unencrypted SMTP emails and modifying invoice wire details.',
                    },
                    {
                      req: '1.6 ii/v: Traffic Sniffer & Hex',
                      theme: 'SilentSnare MITM',
                      impl: 'Live packet sniffer with Wireshark/Ettercap modes and layer frame dissector.',
                    },
                    {
                      req: '1.6 vii: Threat Alerts & IDS',
                      theme: 'SilentSnare MITM',
                      impl: 'Real-time anomaly monitoring for ARP poisoning and cleartext credential leaks.',
                    },
                    {
                      req: '1.2: Defense Countermeasures',
                      theme: 'SilentSnare MITM',
                      impl: 'Enterprise blueprints for Dynamic ARP Inspection (DAI), HSTS Preloading, and 802.1X.',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.req}</td>
                      <td className="py-3 px-4 text-emerald-300 font-mono text-[11px]">{row.theme}</td>
                      <td className="py-3 px-4 text-zinc-300">{row.impl}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% PASS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="glass-panel rounded-3xl p-7 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              Video Recording Script & Checklist (.mp4 Deliverable)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Target Duration: 3 - 5 Minutes</span>
          </div>

          <div className="space-y-4">
            {[
              {
                time: '0:00 - 0:45',
                section: '1. Introduction & Architecture Overview',
                action: 'Open Overview Dashboard. Highlight the Next.js 15 full-stack architecture, Vercel/Neon serverless DB status, and the dual-suite layout.',
              },
              {
                time: '0:45 - 1:45',
                section: '2. CipherGuard PKE Suite Demonstrations',
                action: 'Demonstrate Secure Email (RSA-OAEP 2048 encryption + RSA Prime Explorer), VPN Tunnel (TLS 1.3 handshake + Wireshark stream), and Digital Signatures (Tamper Alarm).',
              },
              {
                time: '1:45 - 2:45',
                section: '3. SilentSnare MITM Interceptor Demonstrations',
                action: 'Trigger Scenario 1 (ARP Poisoning: Intercept, Modify, Drop) and Scenario 2 (Gateway Spoofing: Invoicing hijack and TLS protection toggle).',
              },
              {
                time: '2:45 - 3:30',
                section: '4. Threat Alerts & CLI Studio',
                action: 'Inspect live IDS threat alerts in Notification Center and run OpenSSL / GPG / tshark commands in the CLI Tool Studio.',
              },
              {
                time: '3:30 - 4:00',
                section: '5. Conclusion & Deliverables',
                action: 'Show the Key Vault, export Audit Logs (JSON/CSV), and present the in-app SRS Compliance Dossier.',
              },
            ].map((scene, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{scene.section}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/80 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                    {scene.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{scene.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'slides' && (
        <div className="glass-panel rounded-3xl p-7 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Presentation className="w-4 h-4 text-emerald-400" />
              10-Slide Competition Presentation Blueprint
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">PowerPoint Structure</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: 1, title: 'Title Slide', content: 'CipherGuard: Sentinel of Secrets & SilentSnare MITM Suite. Team Members, Mentor, and TechWiz 6 Category.' },
              { num: 2, title: 'Problem Definition', content: 'Vulnerabilities of cleartext networks: Eavesdropping, Data Alteration, Router Impersonation, and Identity Forgery.' },
              { num: 3, title: 'Proposed Solution Architecture', content: 'Full-stack Next.js 15 + TypeScript cyber-defense platform powered by Web Crypto API and Serverless Postgres.' },
              { num: 4, title: 'CipherGuard: Secure Email (RSA-OAEP)', content: 'Asymmetric encryption model, RSA prime number theory ($p, q, n, e, d$), and confidentiality proof.' },
              { num: 5, title: 'CipherGuard: VPN Tunnel (TLS 1.3)', content: '5-step handshake, ephemeral PKE key exchange, AES-256-GCM symmetric derivation, and Wireshark stream.' },
              { num: 6, title: 'CipherGuard: Digital Signatures (RSA-PSS)', content: 'SHA-256 digest signing, message integrity verification, non-repudiation, and tamper detection.' },
              { num: 7, title: 'SilentSnare: ARP Poisoning (Scenario 1)', content: 'Duplex Ettercap/Arpspoof interception between 2 local workstations with live payload tampering and DoS dropping.' },
              { num: 8, title: 'SilentSnare: Gateway Spoofing (Scenario 2)', content: 'Router tap email interception, invoice modification, and STARTTLS protection comparison.' },
              { num: 9, title: 'Enterprise Defense & Countermeasures', content: 'Dynamic ARP Inspection (DAI), DHCP Snooping, HSTS Preloading, and 802.1X Port Security.' },
              { num: 10, title: 'Conclusion & Key Takeaways', content: 'Summary of results, mathematical proofs, audit trail capabilities, and Q&A.' },
            ].map((slide) => (
              <div key={slide.num} className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                    Slide {slide.num}
                  </span>
                  <h4 className="text-xs font-bold text-emerald-400">{slide.title}</h4>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{slide.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
