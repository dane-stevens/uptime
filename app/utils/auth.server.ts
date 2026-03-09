import crypto from "node:crypto";
export function generateCode() {
	return String(crypto.randomInt(100000, 999999));
}
