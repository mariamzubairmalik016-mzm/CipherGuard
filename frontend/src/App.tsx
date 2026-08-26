import React from 'react';
import { KeyVaultProvider, useKeyVault } from './context/KeyVaultContext';
import { Header } from './components/Header';
import { SecureEmailModule } from './components/Email/SecureEmailModule';
import { VpnHandshakeModule } from './components/Vpn/VpnHandshakeModule';
import { DigitalSignatureModule } from './components/Signature/DigitalSignatureModule';
import { CliToolStudio } from './components/Cli/CliToolStudio';
import { ComparisonModule } from './components/Comparison/ComparisonModule';
import { KeyVaultModal } from './components/KeyVault/KeyVaultModal';
import { AuditLogDrawer } from './components/Common/AuditLogDrawer';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeMode } = useKeyVault();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 flex-1">
      {activeMode === 'email' && <SecureEmailModule />}
      {activeMode === 'vpn' && <VpnHandshakeModule />}
      {activeMode === 'signature' && <DigitalSignatureModule />}
      {activeMode === 'cli' && <CliToolStudio />}
      {activeMode === 'comparison' && <ComparisonModule />}

      <KeyVaultModal />
      <AuditLogDrawer />
    </main>
  );
};

export function App() {
  return (
    <KeyVaultProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        <Header />
        
        <MainContent />

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">CipherGuard • Sentinel of Secrets</span>
          </div>
          <p>© Aptech TechWiz 6 Global AI-Based Tech Competition • Category: Ethical Codebreaking</p>
          <p className="text-[11px] text-slate-600 font-mono">
            PKE Educational Engine • Web Crypto API Standard • Version 1.0 SRS
          </p>
        </footer>
      </div>
    </KeyVaultProvider>
  );
}

export default App;
