import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CryptoKeyPairData, AuditLogEntry, SystemMode } from '../types';
import { generateRSAKeyPair, generateEducationalRSAPrimes } from '../cryptoEngine';
import { saveKeyToDB, saveLogToDB, fetchKeysFromDB, fetchLogsFromDB, checkBackendHealth } from '../apiClient';

interface KeyVaultContextType {
  keys: CryptoKeyPairData[];
  auditLogs: AuditLogEntry[];
  activeMode: SystemMode;
  setActiveMode: (mode: SystemMode) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;
  generateNewKeyPairForOwner: (owner: string, role: 'sender' | 'recipient' | 'server' | 'client', type?: 'RSA-OAEP' | 'RSA-PSS') => Promise<CryptoKeyPairData>;
  getKeyForOwner: (owner: string, type?: 'RSA-OAEP' | 'RSA-PSS') => CryptoKeyPairData | undefined;
  isKeyVaultOpen: boolean;
  setIsKeyVaultOpen: (open: boolean) => void;
  isAuditLogOpen: boolean;
  setIsAuditLogOpen: (open: boolean) => void;
  isBackendConnected: boolean;
}

const KeyVaultContext = createContext<KeyVaultContextType | undefined>(undefined);

export const KeyVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<CryptoKeyPairData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeMode, setActiveMode] = useState<SystemMode>('email');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isKeyVaultOpen, setIsKeyVaultOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Initialize Keys & Check Database Connection
  useEffect(() => {
    async function initKeys() {
      const isConnected = await checkBackendHealth();
      setIsBackendConnected(isConnected);

      // Check if keys already exist in DB
      if (isConnected) {
        const dbKeys = await fetchKeysFromDB();
        const dbLogs = await fetchLogsFromDB();
        if (dbKeys && dbKeys.length > 0) {
          setKeys(dbKeys);
          if (dbLogs) setAuditLogs(dbLogs);
          return;
        }
      }

      // Default Key Generator if DB is empty
      const initialKeys: CryptoKeyPairData[] = [];

      // 1. Alice RSA-OAEP & RSA-PSS Keys
      const aliceOaep = await generateRSAKeyPair('RSA-OAEP', 2048);
      const alicePss = await generateRSAKeyPair('RSA-PSS', 2048);
      const alicePrimes = generateEducationalRSAPrimes();

      const k1: CryptoKeyPairData = {
        id: 'key-alice-oaep',
        owner: 'Alice',
        role: 'sender',
        type: 'RSA-OAEP',
        keySize: 2048,
        publicKeyPem: aliceOaep.publicKeyPem,
        privateKeyPem: aliceOaep.privateKeyPem,
        mathPrimes: alicePrimes,
        createdAt: new Date().toLocaleTimeString(),
      };

      const k2: CryptoKeyPairData = {
        id: 'key-alice-pss',
        owner: 'Alice',
        role: 'sender',
        type: 'RSA-PSS',
        keySize: 2048,
        publicKeyPem: alicePss.publicKeyPem,
        privateKeyPem: alicePss.privateKeyPem,
        createdAt: new Date().toLocaleTimeString(),
      };

      // 2. Bob RSA-OAEP & RSA-PSS Keys
      const bobOaep = await generateRSAKeyPair('RSA-OAEP', 2048);
      const bobPss = await generateRSAKeyPair('RSA-PSS', 2048);
      const bobPrimes = generateEducationalRSAPrimes();

      const k3: CryptoKeyPairData = {
        id: 'key-bob-oaep',
        owner: 'Bob',
        role: 'recipient',
        type: 'RSA-OAEP',
        keySize: 2048,
        publicKeyPem: bobOaep.publicKeyPem,
        privateKeyPem: bobOaep.privateKeyPem,
        mathPrimes: bobPrimes,
        createdAt: new Date().toLocaleTimeString(),
      };

      const k4: CryptoKeyPairData = {
        id: 'key-bob-pss',
        owner: 'Bob',
        role: 'recipient',
        type: 'RSA-PSS',
        keySize: 2048,
        publicKeyPem: bobPss.publicKeyPem,
        privateKeyPem: bobPss.privateKeyPem,
        createdAt: new Date().toLocaleTimeString(),
      };

      // 3. VPN Gateway Server Key
      const vpnKey = await generateRSAKeyPair('RSA-OAEP', 2048);
      const k5: CryptoKeyPairData = {
        id: 'key-vpn-gateway',
        owner: 'VPN Gateway',
        role: 'server',
        type: 'RSA-OAEP',
        keySize: 2048,
        publicKeyPem: vpnKey.publicKeyPem,
        privateKeyPem: vpnKey.privateKeyPem,
        createdAt: new Date().toLocaleTimeString(),
      };

      initialKeys.push(k1, k2, k3, k4, k5);
      setKeys(initialKeys);

      // Sync initial keys to database
      if (isConnected) {
        initialKeys.forEach(k => saveKeyToDB(k));
      }

      // Add initial system boot log
      const bootLog: AuditLogEntry = {
        id: 'log-boot',
        timestamp: new Date().toLocaleTimeString(),
        module: 'system',
        severity: 'info',
        title: 'CipherGuard Engine & Database Initialized',
        details: `Web Crypto API initialized with RSA 2048-bit key pairs. Database status: ${isConnected ? 'SQLite Active' : 'In-Memory'}`,
      };
      setAuditLogs([bootLog]);
      if (isConnected) saveLogToDB(bootLog);
    }

    initKeys();
  }, []);

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 99)]);
    saveLogToDB(newEntry);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  const generateNewKeyPairForOwner = async (
    owner: string,
    role: 'sender' | 'recipient' | 'server' | 'client',
    type: 'RSA-OAEP' | 'RSA-PSS' = 'RSA-OAEP'
  ): Promise<CryptoKeyPairData> => {
    const rsaRes = await generateRSAKeyPair(type, 2048);
    const mathPrimes = generateEducationalRSAPrimes();

    const newKey: CryptoKeyPairData = {
      id: `key-${owner.toLowerCase()}-${Date.now()}`,
      owner,
      role,
      type,
      keySize: 2048,
      publicKeyPem: rsaRes.publicKeyPem,
      privateKeyPem: rsaRes.privateKeyPem,
      mathPrimes,
      createdAt: new Date().toLocaleTimeString(),
    };

    setKeys(prev => [newKey, ...prev]);
    saveKeyToDB(newKey);

    addAuditLog({
      module: 'key-vault',
      severity: 'success',
      title: `Generated New ${type} Key Pair`,
      details: `Created new 2048-bit ${type} key pair for ${owner} and persisted to SQLite database.`,
    });

    return newKey;
  };

  const getKeyForOwner = (owner: string, type: 'RSA-OAEP' | 'RSA-PSS' = 'RSA-OAEP'): CryptoKeyPairData | undefined => {
    return keys.find(k => k.owner.toLowerCase() === owner.toLowerCase() && k.type === type) || keys.find(k => k.owner.toLowerCase() === owner.toLowerCase());
  };

  return (
    <KeyVaultContext.Provider
      value={{
        keys,
        auditLogs,
        activeMode,
        setActiveMode,
        isPlaying,
        setIsPlaying,
        simulationSpeed,
        setSimulationSpeed,
        addAuditLog,
        clearAuditLogs,
        generateNewKeyPairForOwner,
        getKeyForOwner,
        isKeyVaultOpen,
        setIsKeyVaultOpen,
        isAuditLogOpen,
        setIsAuditLogOpen,
        isBackendConnected,
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
