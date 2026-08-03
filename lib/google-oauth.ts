import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'bozer-fallback-secret';

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || '';
}
export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || '';
}
export function googleConfigured() {
  const id = getGoogleClientId();
  const secret = getGoogleClientSecret();
  return !!id && !!secret && !id.startsWith('PLACEHOLDER') && !secret.startsWith('PLACEHOLDER');
}

// Derive the current app origin from request headers so the redirect URI
// matches whichever domain the user is currently on (abacusai.app or the
// custom domain). Both callback URLs must be registered in Google Console.
export function getOrigin(req: Request): string {
  const h = req.headers;
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  return `${proto}://${host}`;
}

export function getRedirectUri(req: Request): string {
  return `${getOrigin(req)}/api/auth/google/callback`;
}

export function buildAuthUrl(req: Request, state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getRedirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(req: Request, code: string): Promise<any> {
  const body = new URLSearchParams({
    code,
    client_id: getGoogleClientId(),
    client_secret: getGoogleClientSecret(),
    redirect_uri: getRedirectUri(req),
    grant_type: 'authorization_code',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('Token exchange failed: ' + t);
  }
  return res.json();
}

export async function getUserInfo(accessToken: string): Promise<{ email: string; name?: string; picture?: string; sub?: string }> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Userinfo failed');
  return res.json();
}

// ---- Signed pending-signup token (holds Google email for username step) ----
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sign(data: string): string {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
}

export function makePendingToken(payload: { email: string; picture?: string }): string {
  const data = b64url(JSON.stringify({ ...payload, t: Date.now() }));
  return `${data}.${sign(data)}`;
}

export function readPendingToken(token: string): { email: string; picture?: string } | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    if (sign(data) !== sig) return null;
    const json = JSON.parse(Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    // 15-minute validity
    if (!json?.email || Date.now() - (json.t || 0) > 15 * 60 * 1000) return null;
    return { email: json.email, picture: json.picture };
  } catch {
    return null;
  }
}

export function makeState(): string {
  return crypto.randomBytes(16).toString('hex');
}
