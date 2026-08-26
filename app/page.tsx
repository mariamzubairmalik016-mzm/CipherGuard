'use client';

import React from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { Header } from '@/components/Header';
import { OverviewDashboard } from '@/components/Dashboard/OverviewDashboard';
import { SecureEmailModule } from '@/components/CipherGuard/SecureEmailModule';
import { VpnTunnelModule } from '@/components/CipherGuard/VpnTunnelModule';
import { SignatureModule } from '@/components/CipherGuard/SignatureModule';
import { ComparisonModule } from '@/components/CipherGuard/ComparisonModule';
import { CliToolStudio } from '@/components/CipherGuard/CliToolStudio';
import { ArpSpoofModule } from '@/components/SilentSnare/ArpSpoofModule';
import { GatewaySpoofModule } from '@/components/SilentSnare/GatewaySpoofModule';
import { PacketSniffer } from '@/components/SilentSnare/PacketSniffer';
import { ThreatAlerts } from '@/components/SilentSnare/ThreatAlerts';
import { DefenseAdvisor } from '@/components/SilentSnare/DefenseAdvisor';
import { ProjectReportViewer } from '@/components/Report/ProjectReportViewer';
import { KeyVaultModal } from '@/components/Modals/KeyVaultModal';
import { AuditLogDrawer } from '@/components/Modals/AuditLogDrawer';
import { Shield, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeMode } = useKeyVault();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
      {activeMode === 'overview' && <OverviewDashboard />}
      {activeMode === 'email' && <SecureEmailModule />}
      {activeMode === 'vpn' && <VpnTunnelModule />}
      {activeMode === 'signature' && <SignatureModule />}
      {activeMode === 'comparison' && <ComparisonModule />}
      {activeMode === 'cli' && <CliToolStudio />}
      {activeMode === 'mitm-arp' && <ArpSpoofModule />}
      {activeMode === 'mitm-gateway' && <GatewaySpoofModule />}
      {activeMode === 'packet-sniffer' && <PacketSniffer />}
      {activeMode === 'threat-alerts' && <ThreatAlerts />}
      {activeMode === 'defense-advisor' && <DefenseAdvisor />}
      {activeMode === 'report' && <ProjectReportViewer />}

      <KeyVaultModal />
      <AuditLogDrawer />
    </main>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Header />
      <MainContent />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2 mt-auto">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300">CipherGuard & SilentSnare • Sentinel of Secrets</span>
        </div>
        <p>© Aptech TechWiz 6 Global AI-Based Tech Competition • Category: Ethical Codebreaking</p>
        <p className="text-[11px] text-slate-600 font-mono">
          Next.js 15 App Router • TypeScript • Web Crypto API • Vercel Serverless Postgres / Local SQLite Engine
        </p>
      </footer>
    </div>
  );
}
