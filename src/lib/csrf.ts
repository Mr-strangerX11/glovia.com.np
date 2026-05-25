// Shared CSRF token state — the backend sets csrf_token on backend.glovia.com.np,
// which JS at glovia.com.np cannot read from document.cookie (different subdomain).
// Instead we fetch it once via GET /auth/csrf-token (GET is CSRF-safe; the browser
// sends the backend's SameSite=None cookie automatically) and cache it here.

let _csrfToken: string | undefined;

export function getCsrfToken(): string | undefined {
  return _csrfToken;
}

export function setCsrfToken(token: string): void {
  _csrfToken = token;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1';

export async function initCsrfToken(): Promise<void> {
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
    // fail silently — mutations will trigger a new fetch if CSRF is missing
  }
}
