import type { Metadata } from 'next';
import './globals.css';
import { KeyVaultProvider } from '@/context/KeyVaultContext';
import { SimulationProvider } from '@/context/SimulationContext';

export const metadata: Metadata = {
  title: 'CipherGuard • Sentinel of Secrets | Aptech TechWiz 6',
  description: 'Unified PKE Educational Cryptography Engine & SilentSnare MITM Interceptor Suite built with Next.js & TypeScript',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
        <KeyVaultProvider>
          <SimulationProvider>
            {children}
          </SimulationProvider>
        </KeyVaultProvider>
      </body>
    </html>
  );
}
