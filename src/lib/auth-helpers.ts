import crypto from "crypto"

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function getResetUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/reset-password/${token}`
}

export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires
}
