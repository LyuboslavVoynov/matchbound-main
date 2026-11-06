import { randomBytes } from "node:crypto";

export const DRAW_EXPIRY_DAYS = 7;

export function createShareToken(): string {
  // 192 bits of entropy, URL-safe and opaque.
  return randomBytes(24).toString("base64url");
}

export function drawExpiresAt(createdAt: Date = new Date()): Date {
  const expiresAt = new Date(createdAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + DRAW_EXPIRY_DAYS);
  return expiresAt;
}
