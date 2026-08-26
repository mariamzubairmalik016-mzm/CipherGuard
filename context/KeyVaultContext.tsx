'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { KeyPairData, SimulationMode, AuditLogEntry, ThreatAlert } from '@/lib/types';
import { generateRsaOaepKeyPair, generateRsaPssKeyPair, generateEducationalRsaMath } from '@/lib/cryptoEngine';

interface KeyVaultContextType {
  keys: KeyPairData[];
  cryptoKeys: Map<string, { public: CryptoKey; private: CryptoKey }>;
  activeMode: SimulationMode;
  setActiveMode: (mode: SimulationMode) => void;
  isVaultOpen: boolean;
  setIsVaultOpen: (open: boolean) => void;
  isLogsOpen: boolean;
  setIsLogsOpen: (open: boolean) => void;
  auditLogs: AuditLogEntry[];
  threatAlerts: ThreatAlert[];
  addAuditLog: (module: string, severity: AuditLogEntry['severity'], title: string, details: string) => Promise<void>;
  addThreatAlert: (alert: ThreatAlert) => Promise<void>;
  generateNewKeyPair: (owner: string, role: string, type?: KeyPairData['type'], keySize?: number) => Promise<KeyPairData>;
  getKeyByOwner: (owner: string, type?: KeyPairData['type']) => KeyPairData | undefined;
  getCryptoKeyByOwner: (owner: string) => { public: CryptoKey; private: CryptoKey } | undefined;
  refreshBackendData: () => Promise<void>;
  dbEngine: string;
}

const KeyVaultContext = createContext<KeyVaultContextType | undefined>(undefined);

export const KeyVaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<KeyPairData[]>([]);
  const [cryptoKeys] = useState<Map<string, { public: CryptoKey; private: CryptoKey }>>(new Map());
  const [activeMode, setActiveMode] = useState<SimulationMode>('overview');
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [dbEngine, setDbEngine] = useState<string>('Detecting...');

  const addAuditLog = useCallback(async (
    module: string,
    severity: AuditLogEntry['severity'],
    title: string,
    details: string
  ) => {
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      module,
      severity,
      title,
      details,
    };

    setAuditLogs(prev => [newLog, ...prev.slice(0, 150)]);

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch {
      // In-memory fallback
    }
  }, []);

  const addThreatAlert = useCallback(async (alert: ThreatAlert) => {
    setThreatAlerts(prev => {
      if (prev.some(a => a.id === alert.id)) return prev;
      return [alert, ...prev];
    });

    try {
      await fetch('/api/mitm/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch {
      // In-memory fallback
    }
  }, []);

  const generateNewKeyPair = useCallback(async (
    owner: string,
    role: string,
    type: KeyPairData['type'] = 'RSA-OAEP',
    keySize: number = 2048
  ): Promise<KeyPairData> => {
    let keyPairResult;
    if (type === 'RSA-PSS') {
      keyPairResult = await generateRsaPssKeyPair(keySize);
    } else {
      keyPairResult = await generateRsaOaepKeyPair(keySize);
    }

    const mathPrimes = generateEducationalRsaMath();

    const keyData: KeyPairData = {
      id: `key_${owner.toLowerCase()}_${type.toLowerCase()}_${Date.now()}`,
      owner,
      role,
      type,
      keySize,
      publicKeyPem: keyPairResult.publicKeyPem,
      privateKeyPem: keyPairResult.privateKeyPem,
      mathPrimes,
      createdAt: new Date().toISOString(),
    };

    cryptoKeys.set(`${owner}_${type}`, {
      public: keyPairResult.publicKey,
      private: keyPairResult.privateKey,
    });

    setKeys(prev => {
      const filtered = prev.filter(k => !(k.owner === owner && k.type === type));
      return [keyData, ...filtered];
    });

    // Save to Database
    try {
      await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData),
      });
    } catch {
      // Local fallback
    }

    await addAuditLog(
      'KeyVault',
      'SUCCESS',
      `New ${type} Keypair Generated`,
      `Generated ${keySize}-bit keypair for ${owner} (${role}) with primes p=${mathPrimes.p}, q=${mathPrimes.q}`
    );

    return keyData;
  }, [cryptoKeys, addAuditLog]);

  const refreshBackendData = useCallback(async () => {
    try {
      // Healthcheck
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setDbEngine(healthData.database || 'Active');
      }

      // Load keys
      const keysRes = await fetch('/api/keys');
      if (keysRes.ok) {
        const keysData: KeyPairData[] = await keysRes.json();
        if (keysData.length > 0) {
          setKeys(keysData);
        }
      }

      // Load logs
      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (logsData.length > 0) {
          setAuditLogs(logsData);
        }
      }

      // Load alerts
      const alertsRes = await fetch('/api/mitm/alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.length > 0) {
          setThreatAlerts(alertsData);
        }
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }, []);

  // Initialize Default Participants (Alice, Bob, Charlie) on first mount
  useEffect(() => {
    const initDefaultKeys = async () => {
      await refreshBackendData();

      // Ensure Alice, Bob, and Charlie have default RSA-OAEP & RSA-PSS keys
      const participants = [
        { name: 'Alice', role: 'Cryptographic Sender / Client' },
        { name: 'Bob', role: 'Cryptographic Recipient / Server' },
        { name: 'Charlie', role: 'Auditor / Third-Party Verifier' },
      ];

      for (const p of participants) {
        await generateNewKeyPair(p.name, p.role, 'RSA-OAEP', 2048);
        await generateNewKeyPair(p.name, p.role, 'RSA-PSS', 2048);
      }
    };

    initDefaultKeys();
  }, [generateNewKeyPair, refreshBackendData]);

  const getKeyByOwner = (owner: string, type: KeyPairData['type'] = 'RSA-OAEP') => {
    return keys.find(k => k.owner.toLowerCase() === owner.toLowerCase() && k.type === type);
  };

  const getCryptoKeyByOwner = (owner: string) => {
    return cryptoKeys.get(`${owner}_RSA-OAEP`) || cryptoKeys.get(`${owner}_RSA-PSS`);
  };

  return (
    <KeyVaultContext.Provider
      value={{
        keys,
        cryptoKeys,
        activeMode,
        setActiveMode,
        isVaultOpen,
        setIsVaultOpen,
        isLogsOpen,
        setIsLogsOpen,
        auditLogs,
        threatAlerts,
        addAuditLog,
        addThreatAlert,
        generateNewKeyPair,
        getKeyByOwner,
        getCryptoKeyByOwner,
        refreshBackendData,
        dbEngine,
      }}
    >
      {children}
    </KeyVaultContext.Provider>
  );
};

export const useKeyVault = () => {
  const context = useContext(KeyVaultContext);
  if (!context) {
    throw new Error('useKeyVault must be used within a KeyVaultProvider');
  }
  return context;
};
