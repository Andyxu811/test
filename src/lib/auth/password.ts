import { createHash } from "node:crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(`tennis-growth-panel:${password}`).digest("hex");
}
