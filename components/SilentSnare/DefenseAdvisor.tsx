'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Layers, 
  CheckCircle2, 
  Server, 
  Wifi, 
  FileCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const DefenseAdvisor: React.FC = () => {
  const defenses = [
    {
      title: '1. Dynamic ARP Inspection (DAI) & DHCP Snooping',
      target: 'Mitigates ARP Poisoning (Scenario 1 & 2)',
      icon: <Wifi className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/20',
      description:
        'Managed layer-2 switches inspect all ARP packets against a trusted DHCP snooping database. Gratuitous ARP replies from unauthorized MAC addresses (such as Ettercap / Arpspoof injectors) are automatically dropped at the hardware switch port.',
      command: 'switch(config)# ip arp inspection vlan 10,20\nswitch(config)# ip dhcp snooping',
    },
    {
      title: '2. HTTPS & HTTP Strict Transport Security (HSTS)',
      target: 'Mitigates Plaintext Interception & SSL Stripping',
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-950/20',
      description:
        'Enforcing HSTS with preloading instructs web browsers never to establish unencrypted HTTP connections. Even if an attacker attempts an SSL-strip downgrade attack, the client browser blocks the insecure connection immediately.',
      command: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    },
    {
      title: '3. End-to-End PKE Email Security (S/MIME & OpenPGP)',
      target: 'Mitigates Gateway Email Hijacking (Scenario 2)',
      icon: <FileCheck className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30 bg-indigo-950/20',
      description:
        'Emails are encrypted at the client application using the recipient’s public key and signed with the sender’s private key before transmitting over SMTP. Compromised network gateways only see opaque ciphertext and cannot modify invoice wire details without breaking signature validation.',
      command: 'gpg --encrypt --sign --recipient vendor@supplier.com invoice_payment.txt',
    },
    {
      title: '4. 802.1X Port Security & VLAN Network Segmentation',
      target: 'Mitigates Unauthorized Physical LAN Tapping',
      icon: <Server className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/20',
      description:
        'Requires all connected workstations to authenticate via RADIUS/EAP before being granted network access. Isolates guest devices into restricted DMZ VLANs to prevent them from snooping internal production traffic.',
      command: 'switch(config-if)# dot1x pae authenticator\nswitch(config-if)# switchport mode access',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* iOS Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Enterprise Defense Strategies & MITM Countermeasures
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-mono font-bold">
                SilentSnare Defense Matrix
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              SilentSnare SRS 1.2: Preventive suggestions such as HTTPS enforcement, SSL certificate validation, Dynamic ARP Inspection, and network segmentation.
            </p>
          </div>
        </div>
      </div>

      {/* Defense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defenses.map((d, idx) => (
          <div key={idx} className={`glass-panel rounded-3xl p-6 sm:p-7 border shadow-xl space-y-4 ${d.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">{d.icon}</div>
                <div>
                  <h3 className="text-sm font-bold text-white">{d.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{d.target}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{d.description}</p>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 whitespace-pre overflow-x-auto scrollbar-thin shadow-inner">
              {d.command}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
