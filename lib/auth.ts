// app/lib/jwt.ts
export type JwtPayloadBase = {
  exp?: number;
  iat?: number;
  [k: string]: any;
};

// ปลอดภัยกับ base64url และกัน error
export function decodeJwt<T extends JwtPayloadBase = JwtPayloadBase>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload?: { exp?: number } | null) {
  if (!payload?.exp) return false;
  return Date.now() / 1000 >= payload.exp;
}
