import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { VpnPacket } from '@/lib/types';

interface VpnRow {
  id: string;
  sequence: number;
  source: string;
  destination: string;
  protocol: string;
  payload_plaintext: string;
  payload_ciphertext: string;
  encrypted: number;
  tls_step?: string;
  timestamp: string;
  hex_dump?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<VpnRow>(`SELECT * FROM vpn_packets ORDER BY sequence ASC`);
    const formatted: VpnPacket[] = rows.map(r => ({
      id: r.id,
      sequence: r.sequence,
      source: r.source,
      destination: r.destination,
      protocol: r.protocol as VpnPacket['protocol'],
      payloadPlaintext: r.payload_plaintext,
      payloadCiphertext: r.payload_ciphertext,
      encrypted: Boolean(r.encrypted),
      tlsHandshakeStep: r.tls_step,
      timestamp: r.timestamp,
      hexDump: r.hex_dump,
    }));
    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, sequence, source, destination, protocol, payloadPlaintext, payloadCiphertext, encrypted, tlsHandshakeStep, timestamp, hexDump } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO vpn_packets (id, sequence, source, destination, protocol, payload_plaintext, payload_ciphertext, encrypted, tls_step, timestamp, hex_dump) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sequence,
        source,
        destination,
        protocol,
        payloadPlaintext,
        payloadCiphertext,
        encrypted ? 1 : 0,
        tlsHandshakeStep || null,
        timestamp || new Date().toISOString(),
        hexDump || null,
      ]
    );

    return NextResponse.json({ id, message: 'VPN packet logged successfully' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM vpn_packets`);
    return NextResponse.json({ message: 'All VPN packets cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
