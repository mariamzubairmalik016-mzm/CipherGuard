'use client';

import React, { useState, useEffect } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Shield, 
  Key, 
  FileText, 
  Mail, 
  Radio, 
  PenTool, 
  Scale, 
  Terminal, 
  Wifi, 
  Server, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  BookOpen,
  Database,
  Sparkles,
  Cpu,
  Lock
} from 'lucide-react';
import { SimulationMode } from '@/lib/types';

export const Header: React.FC = () => {
  const { 
    activeMode, 
    setActiveMode, 
    setIsVaultOpen, 
    setIsLogsOpen, 
    keys, 
    auditLogs, 
    threatAlerts,
    dbEngine 
  } = useKeyVault();

  const [activeSuite, setActiveSuite] = useState<'cipherguard' | 'silentsnare'>('cipherguard');
  const unresolvedAlerts = threatAlerts.filter(a => !a.resolved).length;

  useEffect(() => {
    if (['email', 'vpn', 'signature', 'comparison', 'cli'].includes(activeMode)) {
      setActiveSuite('cipherguard');
    } else if (['mitm-arp', 'mitm-gateway', 'packet-sniffer', 'threat-alerts', 'defense-advisor'].includes(activeMode)) {
      setActiveSuite('silentsnare');
    }
  }, [activeMode]);

  const cipherGuardTabs: { id: SimulationMode; label: string; icon: React.ReactNode; tag: string }[] = [
    { id: 'email', label: 'Secure Email', icon: <Mail className="w-3.5 h-3.5" />, tag: 'RSA-OAEP' },
    { id: 'vpn', label: 'VPN Tunnel', icon: <Radio className="w-3.5 h-3.5" />, tag: 'TLS 1.3' },
    { id: 'signature', label: 'Signatures', icon: <PenTool className="w-3.5 h-3.5" />, tag: 'RSA-PSS' },
    { id: 'comparison', label: 'Analysis Matrix', icon: <Scale className="w-3.5 h-3.5" />, tag: 'Eval' },
    { id: 'cli', label: 'CLI Studio', icon: <Terminal className="w-3.5 h-3.5" />, tag: 'OpenSSL' },
  ];

  const silentSnareTabs: { id: SimulationMode; label: string; icon: React.ReactNode; tag: string }[] = [
    { id: 'mitm-arp', label: 'ARP Poisoning', icon: <Wifi className="w-3.5 h-3.5" />, tag: 'Scen 1' },
    { id: 'mitm-gateway', label: 'Gateway Spoof', icon: <Server className="w-3.5 h-3.5" />, tag: 'Scen 2' },
    { id: 'packet-sniffer', label: 'Traffic Sniffer', icon: <Activity className="w-3.5 h-3.5" />, tag: 'Wireshark' },
    { id: 'threat-alerts', label: 'Threat Alerts', icon: <AlertTriangle className="w-3.5 h-3.5" />, tag: 'IDS' },
    { id: 'defense-advisor', label: 'Defense Advisor', icon: <ShieldAlert className="w-3.5 h-3.5" />, tag: 'HSTS/DAI' },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Floating Stealth Obsidian Glass Nav Bar */}
      <div className="glass-panel rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Ambient Emerald & Ruby Specular Highlights */}
        <div className="absolute -top-24 left-1/4 w-72 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -top-24 right-1/4 w-72 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Dynamic Island Pill */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => setActiveMode('overview')}
            >
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-700 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-all">
                <Shield className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    CipherGuard
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Sentinel of Secrets & SilentSnare</p>
              </div>
            </div>

            {/* Dynamic Telemetry Pill */}
            <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">DB:</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">{dbEngine.split(' ')[0]}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-[11px] font-mono text-purple-300 font-medium">SubtleCrypto Active</span>
            </div>
          </div>

          {/* Segmented Suite Switcher */}
          <div className="flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-black/60 border border-white/10 flex items-center space-x-1 shadow-inner">
              <button
                onClick={() => {
                  setActiveSuite('cipherguard');
                  if (!['email', 'vpn', 'signature', 'comparison', 'cli'].includes(activeMode)) {
                    setActiveMode('email');
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSuite === 'cipherguard'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>CipherGuard (PKE)</span>
              </button>

              <button
                onClick={() => {
                  setActiveSuite('silentsnare');
                  if (!['mitm-arp', 'mitm-gateway', 'packet-sniffer', 'threat-alerts', 'defense-advisor'].includes(activeMode)) {
                    setActiveMode('mitm-arp');
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSuite === 'silentsnare'
                    ? 'bg-gradient-to-r from-rose-500/25 to-orange-500/25 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>SilentSnare (MITM)</span>
                {unresolvedAlerts > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-200 text-[9px] font-bold animate-pulse">
                    {unresolvedAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center space-x-2 justify-end">
            {/* Key Vault */}
            <button
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-amber-500/50 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Vault</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-950/80 text-amber-300 font-mono text-[10px] border border-amber-800">
                {keys.length}
              </span>
            </button>

            {/* Audit Logs */}
            <button
              onClick={() => setIsLogsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-purple-500/50 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Audit</span>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-950/80 text-purple-300 font-mono text-[10px] border border-purple-800">
                {auditLogs.length}
              </span>
            </button>

            {/* Report */}
            <button
              onClick={() => setActiveMode('report')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                activeMode === 'report'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'glass-pill hover:border-emerald-500/50 text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dossier</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center space-x-2.5 overflow-x-auto scrollbar-none">
          {(activeSuite === 'cipherguard' ? cipherGuardTabs : silentSnareTabs).map((tab) => {
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap active:scale-95 transform hover:-translate-y-0.5 ${
                  isActive
                    ? activeSuite === 'cipherguard'
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/40 ring-2 ring-emerald-300'
                      : 'bg-gradient-to-r from-rose-500 via-red-600 to-orange-500 text-white shadow-xl shadow-rose-500/40 ring-2 ring-rose-300'
                    : 'bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 shadow-inner'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                  isActive 
                    ? activeSuite === 'cipherguard'
                      ? 'bg-slate-950/40 text-slate-950 font-black'
                      : 'bg-black/40 text-white font-black'
                    : 'bg-white/5 text-zinc-400 border border-white/10'
                }`}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
