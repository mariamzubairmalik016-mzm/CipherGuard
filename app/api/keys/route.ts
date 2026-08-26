import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { KeyPairData } from '@/lib/types';

interface KeyRow {
  id: string;
  owner: string;
  role: string;
  type: string;
  key_size: number;
  public_key_pem: string;
  private_key_pem: string;
  math_primes_json?: string;
  created_at: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<KeyRow>(`SELECT * FROM keys ORDER BY created_at DESC`);
    const formatted: KeyPairData[] = rows.map(r => ({
      id: r.id,
      owner: r.owner,
      role: r.role,
      type: r.type as KeyPairData['type'],
      keySize: r.key_size,
      publicKeyPem: r.public_key_pem,
      privateKeyPem: r.private_key_pem,
      mathPrimes: r.math_primes_json ? JSON.parse(r.math_primes_json) : undefined,
      createdAt: r.created_at,
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
    const { id, owner, role, type, keySize, publicKeyPem, privateKeyPem, mathPrimes, createdAt } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO keys (id, owner, role, type, key_size, public_key_pem, private_key_pem, math_primes_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        owner,
        role,
        type,
        keySize,
        publicKeyPem,
        privateKeyPem,
        mathPrimes ? JSON.stringify(mathPrimes) : null,
        createdAt || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ id, message: 'Key pair saved successfully' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const db = await getDb();

    if (id) {
      await db.execute(`DELETE FROM keys WHERE id = ?`, [id]);
    } else {
      await db.execute(`DELETE FROM keys`);
    }

    return NextResponse.json({ message: 'Keys deleted successfully' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
