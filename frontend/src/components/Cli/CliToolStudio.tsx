import React, { useState } from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import type { CliCommand } from '../../types';
import { Terminal, Copy, Check } from 'lucide-react';

export const CliToolStudio: React.FC = () => {
  const { addAuditLog } = useKeyVault();
  const [selectedTool, setSelectedTool] = useState<'OpenSSL' | 'GnuPG' | 'Wireshark'>('OpenSSL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(0);

  const cliCommands: CliCommand[] = [
    // OpenSSL Commands
    {
      id: 'cmd-openssl-1',
      tool: 'OpenSSL',
      command: 'openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048',
      description: 'Generate 2048-bit RSA Private Key using OpenSSL CLI',
      output: `.....+++++\n.....................+++++\ne is 65537 (0x10001)\nWriting RSA key to private_key.pem`,
      category: 'KeyGen',
    },
    {
      id: 'cmd-openssl-2',
      tool: 'OpenSSL',
      command: 'openssl rsa -in private_key.pem -pubout -out public_key.pem',
      description: 'Extract Public Key PEM from RSA Private Key file',
      output: `writing RSA key\n-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu\n-----END PUBLIC KEY-----`,
      category: 'KeyGen',
    },
    {
      id: 'cmd-openssl-3',
      tool: 'OpenSSL',
      command: 'openssl pkeyutl -encrypt -in message.txt -out ciphertext.bin -pubin -inkey public_key.pem -pkeyopt rsa_padding_mode:oaep',
      description: 'Encrypt email message using Recipient Public Key with RSA-OAEP padding',
      output: `Successfully encrypted 84 bytes of plaintext into ciphertext.bin (256 bytes).`,
      category: 'Encrypt',
    },
    {
      id: 'cmd-openssl-4',
      tool: 'OpenSSL',
      command: 'openssl dgst -sha256 -sign private_key.pem -out signature.bin message.txt',
      description: 'Create SHA-256 Digital Signature for payload integrity verification',
      output: `SHA256(message.txt)= 8f4e2... Digital Signature saved to signature.bin`,
      category: 'Sign',
    },

    // GnuPG Commands
    {
      id: 'cmd-gpg-1',
      tool: 'GnuPG',
      command: 'gpg --full-generate-key',
      description: 'Generate GPG keypair (RSA 4096-bit for email encryption)',
      output: `gpg: key 0x9B4E281C marked as ultimately trusted\ngpg: revocation certificate stored in '/home/user/.gnupg/openpgp-revocs.d/...'`,
      category: 'KeyGen',
    },
    {
      id: 'cmd-gpg-2',
      tool: 'GnuPG',
      command: 'gpg --encrypt --recipient bob@cipherguard.io --armor message.txt',
      description: 'Encrypt email message with Bob\'s PGP Public Key (ASCII Armored)',
      output: `-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2.2.27\n\nhQEMA4X7+9... [Ciphertext Data]\n-----END PGP MESSAGE-----`,
      category: 'Encrypt',
    },
    {
      id: 'cmd-gpg-3',
      tool: 'GnuPG',
      command: 'gpg --decrypt message.txt.asc',
      description: 'Decrypt PGP email using recipient passphrase & private key',
      output: `gpg: encrypted with 4096-bit RSA key, ID 0x9B4E281C, created 2026-08-24\n"Bob <bob@cipherguard.io>"\nPlaintext decrypted successfully.`,
      category: 'Decrypt',
    },

    // Wireshark Commands
    {
      id: 'cmd-wireshark-1',
      tool: 'Wireshark',
      command: 'tshark -i eth0 -f "tcp port 443" -Y "tls.handshake.type == 1" -T fields -e ip.src -e tls.handshake.extensions_server_name',
      description: 'Capture & inspect TLS 1.3 ClientHello SNI handshake packets',
      output: `192.168.1.100    vpn.cipherguard.io\nHandshake Packet Captured: ClientHello (TLS 1.3)`,
      category: 'Inspect',
    },
    {
      id: 'cmd-wireshark-2',
      tool: 'Wireshark',
      command: 'tshark -r vpn_session.pcap -Y "tls.handshake.type == 11" -V',
      description: 'Inspect Server Certificate & RSA Public Key in Wireshark PCAP dump',
      output: `Handshake Protocol: Certificate\n  Length: 1240\n  Certificates: RSA 2048 bits (SHA256withRSA)`,
      category: 'Inspect',
    },
  ];

  const filteredCommands = cliCommands.filter(cmd => cmd.tool === selectedTool);
  const currentCommand = activeCommandIndex !== null && filteredCommands[activeCommandIndex] ? filteredCommands[activeCommandIndex] : filteredCommands[0];

  const handleCopyCommand = (cmdText: string, id: string) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunCommand = (cmd: CliCommand) => {
    addAuditLog({
      module: 'cli',
      severity: 'info',
      title: `CLI Executed: ${cmd.tool}`,
      details: `Ran command: ${cmd.command}`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">CLI & Cryptographic Tool Studio</h2>
              <span className="text-xs text-cyan-400 font-mono">OpenSSL • GnuPG • Wireshark Execution Workbench</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Demonstrates real command-line cryptographic workflows using industry-standard tools (OpenSSL for keygen/PKE, GnuPG for PGP email security, and Wireshark/tshark for PCAP analysis).
          </p>
        </div>

        {/* Tool Switcher */}
        <div className="flex space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['OpenSSL', 'GnuPG', 'Wireshark'] as const).map(tool => (
            <button
              key={tool}
              onClick={() => {
                setSelectedTool(tool);
                setActiveCommandIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTool === tool
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of Commands */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {selectedTool} Command Sequences
          </h3>

          <div className="space-y-2">
            {filteredCommands.map((cmd, idx) => {
              const isSelected = currentCommand?.id === cmd.id;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    setActiveCommandIndex(idx);
                    handleRunCommand(cmd);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-300">#0{idx + 1} {cmd.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{cmd.tool}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium line-clamp-1">{cmd.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Embedded Interactive Bash Terminal */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
          
          {/* Terminal Window Header Bar */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-400 ml-2">bash - cipherguard-terminal</span>
            </div>

            {currentCommand && (
              <button
                onClick={() => handleCopyCommand(currentCommand.command, currentCommand.id)}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedId === currentCommand.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === currentCommand.id ? 'Copied' : 'Copy Command'}</span>
              </button>
            )}
          </div>

          {/* Terminal View Body */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-96">
            {currentCommand && (
              <>
                <div className="space-y-1">
                  <div className="text-slate-400 text-[11px]"># {currentCommand.description}</div>
                  <div className="flex items-start space-x-2 text-cyan-300">
                    <span className="text-emerald-400 font-bold">$</span>
                    <span className="text-amber-300 font-bold break-all">{currentCommand.command}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase mb-1">Standard Output (stdout)</div>
                  <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {currentCommand.output}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
