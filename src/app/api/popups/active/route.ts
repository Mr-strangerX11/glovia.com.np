import { NextResponse } from 'next/server';
import { getServerErrorSummary } from '@/lib/serverError';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.glovia.com.np/api/v1';

export async function GET() {
  try {
    // Use a short timeout to avoid blocking static builds.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_URL}/popups/active`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch active popups' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `[API /popups/active] Proxy error: ${getServerErrorSummary(error)}`
    );
    // Fail gracefully during build or on network errors to avoid blocking
    // static page generation. Return an empty list of popups as safe fallback.
    return NextResponse.json({ data: [] });
  }
}

