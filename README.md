# anvl-token-gate

Next.js middleware and API utilities for server-side `$ANVL` token-gated feature access.

## Installation

```bash
npm install anvl-token-gate
```

## Usage

### 1. Add auth API route

```ts
// app/api/anvl-auth/route.ts
import { createAnvlAuthHandler } from "anvl-token-gate";

const config = {
  rpcUrl: process.env.ANVL_RPC_URL!,
  anvlMint: process.env.ANVL_MINT!,
  jwtSecret: process.env.ANVL_JWT_SECRET!,
};

export const POST = createAnvlAuthHandler(config);
```

### 2. Protect routes with middleware

```ts
// middleware.ts
import { createAnvlGate } from "anvl-token-gate";

export const middleware = createAnvlGate({
  requiredTier: "smith",
  config: {
    rpcUrl: process.env.ANVL_RPC_URL!,
    anvlMint: process.env.ANVL_MINT!,
    jwtSecret: process.env.ANVL_JWT_SECRET!,
  },
  redirectTo: "/?upgrade=true",
});

export const config = {
  matcher: ["/builder/:path*"],
};
```

### 3. Client: request tier after wallet connect

```ts
const res = await fetch("/api/anvl-auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ wallet: publicKey.toBase58() }),
});
const { tier, balance } = await res.json();
```

## Tiers

| Tier | $ANVL Required |
|------|---------------|
| free | 0 |
| smith | 50,000 |
| legend | 250,000 |

## License

MIT
