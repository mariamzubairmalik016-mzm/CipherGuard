import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MitmPacket } from '@/lib/types';

interface MitmRow {
  id: string;
  scenario: string;
  source_ip: string;
  dest_ip: string;
  source_mac: string;
  dest_mac: string;
  protocol: string;
  raw_payload: string;
  modified_payload?: string;
  intercepted: number;
  forwarded: number;
  dropped: number;
  tampered: number;
  hex_dump: string;
  security_status: string;
  timestamp: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<MitmRow>(`SELECT * FROM mitm_packets ORDER BY timestamp DESC`);
    const formatted: MitmPacket[] = rows.map(r => ({
      id: r.id,
      scenario: r.scenario as MitmPacket['scenario'],
      sourceIp: r.source_ip,
      destIp: r.dest_ip,
      sourceMac: r.source_mac,
      destMac: r.dest_mac,
      protocol: r.protocol,
      rawPayload: r.raw_payload,
      modifiedPayload: r.modified_payload,
      intercepted: Boolean(r.intercepted),
      forwarded: Boolean(r.forwarded),
      dropped: Boolean(r.dropped),
      tampered: Boolean(r.tampered),
      hexDump: r.hex_dump,
      securityStatus: r.security_status as MitmPacket['securityStatus'],
      timestamp: r.timestamp,
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
    const { id, scenario, sourceIp, destIp, sourceMac, destMac, protocol, rawPayload, modifiedPayload, intercepted, forwarded, dropped, tampered, hexDump, securityStatus, timestamp } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO mitm_packets (id, scenario, source_ip, dest_ip, source_mac, dest_mac, protocol, raw_payload, modified_payload, intercepted, forwarded, dropped, tampered, hex_dump, security_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        scenario || 'two_computers',
        sourceIp,
        destIp,
        sourceMac,
        destMac,
        protocol,
        rawPayload,
        modifiedPayload || null,
        intercepted ? 1 : 0,
        forwarded ? 1 : 0,
        dropped ? 1 : 0,
        tampered ? 1 : 0,
        hexDump,
        securityStatus,
        timestamp || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ id, message: 'MITM packet saved' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM mitm_packets`);
    return NextResponse.json({ message: 'All MITM packets cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
