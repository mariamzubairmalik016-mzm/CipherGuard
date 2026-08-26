// API Client for CipherGuard Express SQLite Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function fetchKeysFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/keys`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveKeyToDB(keyData: any) {
  try {
    await fetch(`${API_BASE_URL}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyData),
    });
  } catch (err) {
    console.warn('Backend sync failed, stored in memory:', err);
  }
}

export async function fetchLogsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/logs`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveLogToDB(logData: any) {
  try {
    await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.warn('Backend log sync failed:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveEmailToDB(emailData: any) {
  try {
    await fetch(`${API_BASE_URL}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (err) {
    console.warn('Backend email sync failed:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveVpnPacketToDB(packetData: any) {
  try {
    await fetch(`${API_BASE_URL}/vpn/packets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packetData),
    });
  } catch (err) {
    console.warn('Backend packet sync failed:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveSignatureToDB(signatureData: any) {
  try {
    await fetch(`${API_BASE_URL}/signatures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signatureData),
    });
  } catch (err) {
    console.warn('Backend signature sync failed:', err);
  }
}
