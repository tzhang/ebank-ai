import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// M1 AUTH-101 — 密码哈希(零依赖:node:crypto scrypt)。
// 存储格式:scrypt:<salt hex>:<hash hex>
const scrypt = promisify(_scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algo, saltHex, keyHex] = stored.split(":");
  if (algo !== "scrypt" || !saltHex || !keyHex) return false;
  try {
    const key = Buffer.from(keyHex, "hex");
    const calc = (await scrypt(password, Buffer.from(saltHex, "hex"), key.length)) as Buffer;
    return key.length === calc.length && timingSafeEqual(key, calc);
  } catch {
    return false;
  }
}
