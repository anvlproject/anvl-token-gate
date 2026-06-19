import { SignJWT, jwtVerify } from "jose";
import { AnvlTierInfo, TokenGateConfig } from "./types";

function getSecret(config: TokenGateConfig): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

export async function signTierJwt(info: AnvlTierInfo, config: TokenGateConfig): Promise<string> {
  return new SignJWT({ ...info })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getSecret(config));
}

export async function verifyTierJwt(
  token: string,
  config: TokenGateConfig
): Promise<AnvlTierInfo | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(config));
    return payload as unknown as AnvlTierInfo;
  } catch {
    return null;
  }
}
