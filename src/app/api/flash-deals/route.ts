import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/flash-deals/active`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 30 },
    });
    if (!res.ok) return NextResponse.json({ data: [] });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ data: [] });
  }
}
