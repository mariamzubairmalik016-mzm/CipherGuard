import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json({
      status: 'ok',
      system: 'CipherGuard & SilentSnare Serverless REST API',
      database: db.getEngine(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: 'error', error: errorMsg },
      { status: 500 }
    );
  }
}
