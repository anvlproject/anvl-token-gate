import { NextRequest, NextResponse } from "next/server";
import { verifyTierJwt } from "./jwt";
import { AnvlTier, TokenGateConfig } from "./types";

/**
 * Next.js App Router middleware factory.
 *
 * Usage in middleware.ts:
 *   import { createAnvlGate } from "anvl-token-gate";
 *   export const middleware = createAnvlGate({ requiredTier: "smith", config });
 *   export const config = { matcher: ["/builder/:path*"] };
 */
export function createAnvlGate(options: {
  requiredTier: AnvlTier;
  config: TokenGateConfig;
  redirectTo?: string;
}) {
  const { requiredTier, config, redirectTo = "/?upgrade=true" } = options;
  const tierRank: Record<AnvlTier, number> = { free: 0, smith: 1, legend: 2 };

  return async function middleware(req: NextRequest): Promise<NextResponse> {
    const cookieName = config.cookieName ?? "anvl_tier";
    const token = req.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    const info = await verifyTierJwt(token, config);
    if (!info || tierRank[info.tier] < tierRank[requiredTier]) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // Pass tier info to the route via header
    const res = NextResponse.next();
    res.headers.set("x-anvl-tier", info.tier);
    res.headers.set("x-anvl-wallet", info.wallet);
    return res;
  };
}
