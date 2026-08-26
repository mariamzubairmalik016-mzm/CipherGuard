import React from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { X, Trash2, Download, ShieldAlert, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const AuditLogDrawer: React.FC = () => {
  const { isAuditLogOpen, setIsAuditLogOpen, auditLogs, clearAuditLogs } = useKeyVault();

  if (!isAuditLogOpen) return null;

  const exportReport = () => {
    const reportText = `=====================================================
CIPHERGUARD EDUCATIONAL SIMULATION REPORT
Generated: ${new Date().toLocaleString()}
System Theme: Sentinel of Secrets
=====================================================

--- SECURITY EVENT AUDIT LOG ---
${auditLogs.map(log => `[${log.timestamp}] [${log.severity.toUpperCase()}] [${log.module.toUpperCase()}] ${log.title}\nDetails: ${log.details}\n`).join('\n')}

=====================================================
End of CipherGuard Simulation Report
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CipherGuard-AuditReport-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Security Audit Log</h2>
          </div>
          <button
            onClick={() => setIsAuditLogOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">Total Events: {auditLogs.length}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportReport}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={clearAuditLogs}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No audit logs captured yet. Perform cryptographic actions to see events.
            </div>
          ) : (
            auditLogs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border bg-slate-950/80 transition-all ${
                  log.severity === 'error'
                    ? 'border-rose-800/80 bg-rose-950/20'
                    : log.severity === 'warning'
                    ? 'border-amber-800/80 bg-amber-950/20'
                    : log.severity === 'success'
                    ? 'border-emerald-800/80 bg-emerald-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(log.severity)}
                    <span className="font-bold text-slate-200">{log.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-400 leading-relaxed font-sans text-xs ml-6">{log.details}</p>
                <div className="mt-2 ml-6 flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 uppercase">
                    {log.module}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
