'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  FileText, 
  X, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldAlert 
} from 'lucide-react';
import { AuditLogEntry } from '@/lib/types';

export const AuditLogDrawer: React.FC = () => {
  const { auditLogs, isLogsOpen, setIsLogsOpen, addAuditLog } = useKeyVault();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isLogsOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSev = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesSearch = searchQuery === '' || 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cipherguard_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Timestamp', 'Module', 'Severity', 'Title', 'Details'];
    const rows = auditLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.module}"`,
      `"${l.severity}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `cipherguard_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl h-full glass-panel border-l border-white/10 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                System Audit Trail & Event Logs
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">
                  {auditLogs.length} Events
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Tamper-evident chronological record of all cryptographic operations.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLogsOpen(false)}
            className="p-2.5 rounded-2xl glass-pill hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-white/10 bg-black/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all active:scale-95 ${
                  filterSeverity === sev
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-pill text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportToJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-cyan-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportToCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-emerald-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-black/30 border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search audit trail by module, keyword, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Logs Stream */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log: AuditLogEntry) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 hover:border-white/20 transition-all font-mono text-xs shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : log.severity === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="text-cyan-400 font-bold font-sans">{log.module}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                </div>

                <div className="font-bold text-white font-sans text-xs">{log.title}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{log.details}</p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 font-sans">
              No matching audit events found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
