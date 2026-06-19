import { Connection, PublicKey } from "@solana/web3.js";
import { balanceToTier, AnvlTierInfo, TokenGateConfig } from "./types";

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/**
 * Fetch the real $ANVL balance for a wallet from Solana RPC.
 * Returns tier info ready to be signed into a JWT.
 */
export async function fetchAnvlTier(
  walletAddress: string,
  config: TokenGateConfig
): Promise<AnvlTierInfo> {
  const connection = new Connection(config.rpcUrl, "confirmed");
  const walletPubkey = new PublicKey(walletAddress);
  const mintPubkey = new PublicKey(config.anvlMint);

  const accounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
    mint: mintPubkey,
    programId: TOKEN_PROGRAM,
  });

  const balance = accounts.value.length > 0
    ? (accounts.value[0].account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0)
    : 0;

  return {
    tier: balanceToTier(balance),
    balance,
    wallet: walletAddress,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
  };
}
