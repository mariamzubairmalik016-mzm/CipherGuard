import React from 'react';
import { useKeyVault } from '../context/KeyVaultContext';
import type { SystemMode } from '../types';
import { Shield, Mail, Lock, FileSignature, Terminal, BarChart2, Key, ListFilter, Database } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeMode, setActiveMode, keys, auditLogs, setIsKeyVaultOpen, setIsAuditLogOpen, isBackendConnected } = useKeyVault();

  const navItems: { id: SystemMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'email', label: 'Secure Email (PKE)', icon: Mail },
    { id: 'vpn', label: 'VPN Handshake & Tunnel', icon: Lock },
    { id: 'signature', label: 'Digital Signatures', icon: FileSignature },
    { id: 'cli', label: 'CLI Tool Studio', icon: Terminal },
    { id: 'comparison', label: 'Comparison Engine', icon: BarChart2 },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Shield className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                CipherGuard
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                v1.0 SRS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Sentinel of Secrets • Cryptographic Simulation & Analysis Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMode(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Vault & Audit Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Key Vault Trigger */}
          <button
            onClick={() => setIsKeyVaultOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Key Vault</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
              {keys.length}
            </span>
          </button>

          {/* Audit Logs Trigger */}
          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm relative"
          >
            <ListFilter className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Audit Logs</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-amber-950 text-amber-400 font-mono border border-amber-800">
              {auditLogs.length}
            </span>
          </button>

          {/* Real-time Database & WebCrypto Status Badge */}
          <div className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono ${
            isBackendConnected
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>{isBackendConnected ? 'SQLite Active' : 'WebCrypto Active'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
