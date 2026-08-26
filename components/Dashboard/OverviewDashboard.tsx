'use client';

import React from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Shield, 
  Mail, 
  Radio, 
  PenTool, 
  Terminal, 
  Wifi, 
  Server, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  BookOpen, 
  Lock, 
  Unlock, 
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Zap,
  Key,
  Layers,
  Cpu,
  Scale
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { setActiveMode, keys, auditLogs, threatAlerts, dbEngine } = useKeyVault();

  const stats = [
    { 
      label: 'RSA Key Pairs in Vault', 
      value: keys.length, 
      icon: <Lock className="w-5 h-5 text-emerald-400" />, 
      sub: '2048-bit Asymmetric Pairs',
      glow: 'glow-emerald'
    },
    { 
      label: 'Cryptographic Audit Events', 
      value: auditLogs.length, 
      icon: <Activity className="w-5 h-5 text-purple-400" />, 
      sub: 'Real-time Chronological Logs',
      glow: 'glow-purple'
    },
    { 
      label: 'MITM Security Alerts', 
      value: threatAlerts.length, 
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, 
      sub: 'IDS Anomaly Detection',
      glow: 'glow-ruby'
    },
    { 
      label: 'Serverless Database Driver', 
      value: dbEngine.split(' ')[0], 
      icon: <Database className="w-5 h-5 text-amber-400" />, 
      sub: 'Neon / Vercel + Local SQLite',
      glow: 'glow-gold'
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stealth Obsidian & Aurora Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl">
        {/* Animated Background Mesh Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/15 to-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-rose-600/10 rounded-full blur-3xl pointer-events-none animate-float-orb"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-xl shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Aptech TechWiz 6 • Category: Ethical Codebreaking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              CipherGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400">&</span> SilentSnare
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
              Next-generation spatial cybersecurity platform demonstrating <strong className="text-emerald-400 font-semibold">Public Key Encryption (PKE)</strong> defense suites alongside live <strong className="text-rose-400 font-semibold">Man-in-the-Middle (MITM)</strong> network attack vectors, packet sniffers, and SSL/TLS countermeasures.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => setActiveMode('email')}
                className="glowing-btn-emerald flex items-center space-x-2.5 px-7 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-2xl"
              >
                <Shield className="w-4 h-4" />
                <span>Launch PKE Defense Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveMode('mitm-arp')}
                className="glowing-btn-ruby flex items-center space-x-2.5 px-7 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-2xl"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Launch MITM Interceptor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* System Telemetry Card */}
          <div className="p-6 rounded-3xl bg-black/70 border border-white/15 backdrop-blur-2xl space-y-4 max-w-sm w-full shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> System Telemetry
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> OPTIMAL
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400">Crypto Engine:</span>
                <span className="text-emerald-400 font-bold">W3C SubtleCrypto</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400">Database Layer:</span>
                <span className="text-purple-300 font-bold">{dbEngine.split(' ')[0]}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400">Active RSA Modulus:</span>
                <span className="text-amber-300 font-bold">2048-bit OAEP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-6 space-y-3 relative overflow-hidden border border-white/15 shadow-2xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{stat.label}</span>
              <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/10 shadow-lg">{stat.icon}</div>
            </div>
            <div className="text-4xl font-black text-white font-mono tracking-tight">{stat.value}</div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Dual Simulation Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Suite: CipherGuard (PKE Defense) */}
        <div className="glass-panel rounded-3xl p-7 border border-emerald-500/20 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">CipherGuard: PKE Defense Suite</h2>
                <p className="text-xs text-zinc-400 font-medium">Asymmetric Cryptography, Key Exchange & Digital Signatures</p>
              </div>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
              SRS v1.0
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'email' as const,
                title: 'Secure Email Encryption (RSA-OAEP 2048)',
                desc: 'Recipient public key encryption with private key decryption & RSA prime math (p, q, n, e, d).',
                icon: <Mail className="w-4 h-4 text-emerald-400" />,
              },
              {
                id: 'vpn' as const,
                title: 'VPN Handshake & Tunnel (TLS 1.3)',
                desc: 'Hybrid key exchange deriving AES-256-GCM symmetric session key with Wireshark inspector.',
                icon: <Radio className="w-4 h-4 text-emerald-400" />,
              },
              {
                id: 'signature' as const,
                title: 'Digital Signatures & Tamper Alarm',
                desc: 'SHA-256 digest + RSA-PSS signing proving message integrity and non-repudiation.',
                icon: <PenTool className="w-4 h-4 text-emerald-400" />,
              },
              {
                id: 'comparison' as const,
                title: 'PKE vs VPN Comparison Matrix',
                desc: 'Comparative analysis of performance overhead, confidentiality vs authenticity, and tradeoffs.',
                icon: <Scale className="w-4 h-4 text-emerald-400" />,
              },
              {
                id: 'cli' as const,
                title: 'Cryptographic CLI Tool Studio',
                desc: 'Interactive terminal running OpenSSL, GnuPG, and Wireshark tshark shell commands.',
                icon: <Terminal className="w-4 h-4 text-emerald-400" />,
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className="glass-card rounded-2xl p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-emerald-500/40 transition-colors">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{m.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Suite: SilentSnare (MITM Interceptor) */}
        <div className="glass-panel rounded-3xl p-7 border border-rose-500/20 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">SilentSnare: MITM Interceptor Suite</h2>
                <p className="text-xs text-zinc-400 font-medium">ARP Poisoning, Gateway Spoofing & Traffic Sniffing</p>
              </div>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 font-mono font-bold">
              SRS v1.0
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'mitm-arp' as const,
                title: 'Scenario 1: ARP Poisoning Between 2 Hosts',
                desc: 'Computer A <-> Attacker <-> Computer B duplex interception, packet dropping & tampering.',
                icon: <Wifi className="w-4 h-4 text-rose-400" />,
              },
              {
                id: 'mitm-gateway' as const,
                title: 'Scenario 2: Gateway Spoofing Email Hijacking',
                desc: 'Impersonate default router, capture unencrypted SMTP emails, and modify payloads.',
                icon: <Server className="w-4 h-4 text-rose-400" />,
              },
              {
                id: 'packet-sniffer' as const,
                title: 'Real-Time Traffic Sniffer & Hex Analyzer',
                desc: 'Live Wireshark/Ettercap packet capture stream with hex dump and protocol decoding.',
                icon: <Activity className="w-4 h-4 text-rose-400" />,
              },
              {
                id: 'threat-alerts' as const,
                title: 'Anomaly Detection & Real-time Alerts',
                desc: 'Intrusion detection monitoring ARP poisoning, cleartext passwords, and integrity violations.',
                icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
              },
              {
                id: 'defense-advisor' as const,
                title: 'Security Defense & Countermeasures',
                desc: 'Preventive strategies: HTTPS/HSTS, Dynamic ARP Inspection (DAI), 802.1X, and S/MIME.',
                icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className="glass-card glass-card-ruby rounded-2xl p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-rose-500/40 transition-colors">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{m.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
