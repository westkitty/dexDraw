import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface BoardTokenPayload extends JWTPayload {
  boardId: string;
  userId: string;
  role: 'view' | 'comment' | 'edit';
}

let secretKey: Uint8Array;

export function initTokenSecret(secret: string): void {
  secretKey = new TextEncoder().encode(secret);
}

/**
 * Create an expiring board token.
 * Default TTL: 24 hours.
 */
export async function createBoardToken(
  boardId: string,
  userId: string,
  role: 'view' | 'comment' | 'edit',
  ttlSeconds = 86400,
): Promise<string> {
  const token = await new SignJWT({ boardId, userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey);
  return token;
}

/**
 * Verify and decode a board token.
 * Throws on invalid/expired tokens.
 */
export async function verifyBoardToken(token: string): Promise<BoardTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as BoardTokenPayload;
}
