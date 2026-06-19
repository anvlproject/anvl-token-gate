export type AnvlTier = "free" | "smith" | "legend";

export interface AnvlTierInfo {
  tier: AnvlTier;
  balance: number;
  wallet: string;
  expiresAt: number;
}

export interface TokenGateConfig {
  rpcUrl: string;
  anvlMint: string;
  jwtSecret: string;
  cookieName?: string;
  cookieMaxAgeSec?: number;
}

export const TIER_THRESHOLDS: Record<AnvlTier, number> = {
  free: 0,
  smith: 50_000,
  legend: 250_000,
};

export function balanceToTier(balance: number): AnvlTier {
  if (balance >= TIER_THRESHOLDS.legend) return "legend";
  if (balance >= TIER_THRESHOLDS.smith) return "smith";
  return "free";
}
