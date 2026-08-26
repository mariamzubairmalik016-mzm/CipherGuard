'use client';

import React, { useState } from 'react';
import { useKeyVault } from '@/context/KeyVaultContext';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Shield, 
  Activity,
  Code
} from 'lucide-react';

export const CliToolStudio: React.FC = () => {
  const { addAuditLog } = useKeyVault();

  const [activeCliTool, setActiveCliTool] = useState<'openssl' | 'gnupg' | 'wireshark'>('openssl');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const opensslCommands = [
    {
      label: '1. Generate RSA 2048-bit Private Key',
      cmd: 'openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048',
      output: `........+++++
....................................................................+++++
writing RSA key into private_key.pem (2048 bits)`,
    },
    {
      label: '2. Extract Public Key from Private Key',
      cmd: 'openssl rsa -in private_key.pem -pubout -out public_key.pem',
      output: `writing RSA key
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3QvK...
-----END PUBLIC KEY-----`,
    },
    {
      label: '3. Encrypt Plaintext Message using RSA-OAEP',
      cmd: 'openssl pkeyutl -encrypt -in secret_message.txt -out encrypted_message.bin -pubin -inkey public_key.pem -pkeyopt rsa_padding_mode:oaep',
      output: `[SUCCESS] Payload (256 bytes) encrypted with OAEP padding and SHA-256 digest.`,
    },
    {
      label: '4. Sign Document Hash Digest with RSA Private Key',
      cmd: 'openssl dgst -sha256 -sign private_key.pem -out document.sig secret_message.txt',
      output: `[SUCCESS] Generated 256-byte digital signature: document.sig`,
    },
    {
      label: '5. Verify Digital Signature with Public Key',
      cmd: 'openssl dgst -sha256 -verify public_key.pem -signature document.sig secret_message.txt',
      output: `Verified OK`,
    },
  ];

  const gnupgCommands = [
    {
      label: '1. Generate GPG Keypair (Interactive)',
      cmd: 'gpg --full-generate-key --batch < keygen_spec.txt',
      output: `gpg: key 0x9F4B3C1D marked as ultimately trusted
gpg: revocation certificate stored as '~/.gnupg/openpgp-revocs.d/0x9F4B3C1D.rev'
public and secret key created and signed.`,
    },
    {
      label: '2. Encrypt Email Message with GPG ASCII Armor',
      cmd: 'gpg --encrypt --armor --recipient bob@cipherguard.io email_body.txt',
      output: `-----BEGIN PGP MESSAGE-----
Version: GnuPG v2.4.4 (Darwin)

hQGMA8gW+B0ZJ...
=7kLP
-----END PGP MESSAGE-----`,
    },
    {
      label: '3. Decrypt GPG Message',
      cmd: 'gpg --decrypt email_body.txt.asc',
      output: `gpg: encrypted with 2048-bit RSA key, ID 0x9F4B3C1D, created 2026-08-25
      "Bob Recipient <bob@cipherguard.io>"
[PLAINTEXT PAYLOAD]: Dear Bob, review confidential quantum handshake.`,
    },
  ];

  const wiresharkCommands = [
    {
      label: '1. Capture TLS 1.3 Handshake via tshark',
      cmd: 'tshark -i en0 -f "tcp port 443 or tcp port 5001" -Y "tls.handshake" -T fields -e frame.number -e ip.src -e ip.dst -e tls.handshake.type',
      output: `1  192.168.1.10  192.168.1.1  1 (Client Hello)
2  192.168.1.1   192.168.1.10  2 (Server Hello, Change Cipher Spec)
3  192.168.1.1   192.168.1.10  11 (Encrypted Extensions, Certificate)
4  192.168.1.10  192.168.1.1   20 (Finished - Key Exchange Established)`,
    },
    {
      label: '2. Hex Dump Encrypted VPN Tunnel Stream',
      cmd: 'tshark -i en0 -Y "tls.record.content_type == 23" -x | head -n 12',
      output: `0000  00 1a 2b 3c 4d 5e 00 2a  3b 4c 5d 6f 08 00 45 00  ..+<M^.* ;L]o..E.
0010  00 64 a1 b2 40 00 40 06  e5 1c c0 a8 01 0a c0 a8  .d..@.@. ........
0020  01 01 13 89 13 88 00 00  00 00 00 00 00 00 80 18  ........ ........
0030  17 03 03 00 35 [AES-256-GCM Encrypted Application Data Record]`,
    },
  ];

  const handleRunCommand = async (cmd: string, output: string) => {
    setTerminalOutput(prev => [
      ...prev,
      `user@cipherguard-macOS:~$ ${cmd}`,
      output,
      '',
    ]);

    await addAuditLog(
      'CLIScript',
      'INFO',
      `CLI Executed: ${cmd.split(' ')[0]}`,
      `Executed: "${cmd}"`
    );
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Cryptographic CLI Tool Studio
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                OpenSSL • GnuPG • tshark
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              SRS 1.6 v: Pre-built command-line demonstrations and lightweight scripts showing cryptographic workflows.
            </p>
          </div>
        </div>

        <button
          onClick={() => setTerminalOutput([])}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-pill hover:border-emerald-500/50 text-xs font-bold text-zinc-300 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Terminal</span>
        </button>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2">
        {[
          { id: 'openssl' as const, label: 'OpenSSL (RSA / OAEP / Sign)', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
          { id: 'gnupg' as const, label: 'GnuPG (Email PGP Encryption)', icon: <Layers className="w-4 h-4 text-purple-400" /> },
          { id: 'wireshark' as const, label: 'Wireshark / tshark (Packet Capture)', icon: <Activity className="w-4 h-4 text-teal-400" /> },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveCliTool(tool.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeCliTool === tool.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'glass-pill text-zinc-400 hover:text-white'
            }`}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command Runner List */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            Executable Command Recipes ({activeCliTool.toUpperCase()})
          </h3>

          <div className="space-y-3">
            {(activeCliTool === 'openssl'
              ? opensslCommands
              : activeCliTool === 'gnupg'
              ? gnupgCommands
              : wiresharkCommands
            ).map((cmdObj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{cmdObj.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopy(cmdObj.cmd, idx)}
                      className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      title="Copy Command"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRunCommand(cmdObj.cmd, cmdObj.output)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] shadow-sm transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 text-slate-950" />
                      <span>Execute</span>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-zinc-300 overflow-x-auto scrollbar-thin border border-white/5">
                  {cmdObj.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Output */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-2">cipherguard-terminal • zsh</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ACTIVE
            </span>
          </div>

          <div className="font-mono text-xs text-zinc-200 bg-black/70 p-4 rounded-2xl flex-1 overflow-y-auto max-h-[440px] scrollbar-thin space-y-1 shadow-inner">
            <div className="text-zinc-500">
              # CipherGuard CLI Execution Shell Environment
              <br /># Click &quot;Execute&quot; on any command to run realistic cryptographic operations.
              <br />------------------------------------------------------------
            </div>
            {terminalOutput.map((line, index) => (
              <div
                key={index}
                className={
                  line.startsWith('user@')
                    ? 'text-emerald-400 font-bold'
                    : line.includes('[SUCCESS]') || line.includes('Verified OK')
                    ? 'text-teal-300 font-bold'
                    : line.includes('BEGIN') || line.includes('END')
                    ? 'text-amber-300'
                    : 'text-zinc-300'
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
