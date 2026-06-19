import { NextRequest, NextResponse } from "next/server";
import { fetchAnvlTier } from "./verify";
import { signTierJwt } from "./jwt";
import { TokenGateConfig } from "./types";

/**
 * Drop-in API route handler for /api/anvl-auth.
 * Client sends: { wallet: string }
 * Returns: JWT cookie + tier info.
 *
 * Usage:
 *   // app/api/anvl-auth/route.ts
 *   import { createAnvlAuthHandler } from "anvl-token-gate";
 *   export const POST = createAnvlAuthHandler(config);
 */
export function createAnvlAuthHandler(config: TokenGateConfig) {
  return async function POST(req: NextRequest): Promise<NextResponse> {
    const { wallet } = (await req.json()) as { wallet?: string };

    if (!wallet || wallet.length < 32) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    try {
      const info = await fetchAnvlTier(wallet, config);
      const jwt = await signTierJwt(info, config);

      const res = NextResponse.json({ tier: info.tier, balance: info.balance });
      res.cookies.set(config.cookieName ?? "anvl_tier", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: config.cookieMaxAgeSec ?? 300,
        path: "/",
      });
      return res;
    } catch (err) {
      console.error("[anvl-token-gate]", err);
      return NextResponse.json({ error: "Failed to fetch balance" }, { status: 502 });
    }
  };
}
