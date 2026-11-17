import argon2 from "argon2";

// OWASP recommended argon2id parameters (19 MiB, 2 iterations, 1 lane)
const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashPassword = (plain: string) => argon2.hash(plain, HASH_OPTIONS);

export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // malformed hash: treat as mismatch rather than a 500
    return false;
  }
}

// Used when the email doesn't exist so the response time matches a real check
// and can't be used to discover which emails are registered.
let dummyHash: Promise<string> | undefined;
export async function burnPasswordCheck(plain: string): Promise<void> {
  dummyHash ??= hashPassword("dummy-password-for-timing-equalization");
  await verifyPassword(await dummyHash, plain);
}
