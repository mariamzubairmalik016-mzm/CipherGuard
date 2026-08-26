import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ThreatAlert } from '@/lib/types';

interface AlertRow {
  id: string;
  level: string;
  type: string;
  title: string;
  description: string;
  mitigation: string;
  resolved: number;
  timestamp: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<AlertRow>(`SELECT * FROM mitm_alerts ORDER BY timestamp DESC`);
    const formatted: ThreatAlert[] = rows.map(r => ({
      id: r.id,
      level: r.level as ThreatAlert['level'],
      type: r.type as ThreatAlert['type'],
      title: r.title,
      description: r.description,
      mitigation: r.mitigation,
      resolved: Boolean(r.resolved),
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
    const { id, level, type, title, description, mitigation, resolved, timestamp } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO mitm_alerts (id, level, type, title, description, mitigation, resolved, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        level,
        type,
        title,
        description,
        mitigation,
        resolved ? 1 : 0,
        timestamp || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ id, message: 'Threat alert recorded' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM mitm_alerts`);
    return NextResponse.json({ message: 'All alerts cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
