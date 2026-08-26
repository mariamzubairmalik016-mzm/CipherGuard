'use client';

import React from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';
import { ThreatAlert } from '@/lib/types';

export const ThreatAlerts: React.FC = () => {
  const { threatAlerts, addAuditLog, setActiveMode } = useKeyVault();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* iOS Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Intrusion Detection & Real-Time Threat Alerts
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700 font-mono font-bold">
                SilentSnare IDS Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              SilentSnare SRS 1.6 vii: Continuous anomaly monitoring for ARP poisoning, gateway impersonation, and cleartext credential exposure.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveMode('defense-advisor')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950" />
          <span>View Defense Countermeasures</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* Threat List */}
      <div className="space-y-4">
        {threatAlerts.length > 0 ? (
          threatAlerts.map((alert: ThreatAlert) => (
            <div
              key={alert.id}
              className={`glass-panel rounded-3xl p-6 sm:p-7 border transition-all ${
                alert.level === 'CRITICAL'
                  ? 'border-rose-500/40 shadow-2xl shadow-rose-950/30'
                  : alert.level === 'HIGH'
                  ? 'border-amber-500/40 shadow-xl'
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      alert.level === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-200 border border-rose-700'
                        : 'bg-amber-950 text-amber-200 border border-amber-700'
                    }`}>
                      {alert.level} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-slate-400">{alert.timestamp}</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">[{alert.type}]</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">{alert.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 max-w-md space-y-1.5 shadow-inner shrink-0">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Recommended Mitigation:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{alert.mitigation}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 rounded-3xl glass-panel border border-dashed border-white/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Threat Anomalies Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Run Scenario 1 (ARP Poisoning) or Scenario 2 (Gateway Spoofing) to simulate attacks and trigger the real-time intrusion detection engine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
