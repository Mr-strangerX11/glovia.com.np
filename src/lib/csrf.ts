// CSRF token — the backend sets csrf_token with Domain=.glovia.com.np so JS
// at glovia.com.np can read it directly from document.cookie.
// We also cache it in memory to avoid repeated cookie parsing.

let _csrfToken: string | undefined;

function readCsrfCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match.split('=')[1]);
  } catch {
    return match.split('=')[1];
  }
}

export function getCsrfToken(): string | undefined {
  return _csrfToken || readCsrfCookie();
}

export function setCsrfToken(token: string): void {
  _csrfToken = token;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1';

export async function initCsrfToken(): Promise<void> {
  // Primary: read directly from cookie (works when COOKIE_DOMAIN=.glovia.com.np)
  const fromCookie = readCsrfCookie();
  if (fromCookie) {
    _csrfToken = fromCookie;
    return;
  }
  // Fallback: fetch from backend (browser sends SameSite=None cookies cross-origin)
  try {
    const res = await fetch(`${API_BASE}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.csrfToken) _csrfToken = data.csrfToken;
    }
  } catch {
    // ignore — will 403 if CSRF is missing, which is expected behaviour
  }
}
