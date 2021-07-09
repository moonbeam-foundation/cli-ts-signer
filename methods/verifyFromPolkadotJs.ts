import { u8aToHex, u8aToU8a } from "@polkadot/util";
import elliptic from "elliptic";
import { isReady, keccak256 } from "@polkadot/wasm-crypto";
import js from "js-sha3";

const EC = elliptic.ec;

export const secp256k1 = new EC("secp256k1");

export function keccakAsU8a(
  value: Buffer | Uint8Array | string,
  bitLength: 256 | 512 = 256,
  onlyJs = false
): Uint8Array {
  const is256 = bitLength === 256;

  return isReady() && is256 && !onlyJs
    ? keccak256(u8aToU8a(value))
    : new Uint8Array((is256 ? js.keccak256 : js.keccak512).update(u8aToU8a(value)).arrayBuffer());
}

export function secp256k1Hasher(data: Uint8Array | string): Uint8Array {
  return isReady() ? keccakAsU8a(data) : keccakAsU8a(data);
}

export function verifyFromPolkadotJs(message: string, signature: string): string {
  const u8a = u8aToU8a(signature);
  const publicKey = new Uint8Array(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    secp256k1
      .recoverPubKey(
        secp256k1Hasher(message),
        { r: u8a.slice(0, 32), s: u8a.slice(32, 64) },
        u8a[64]
      )
      .encodeCompressed()
  );
  return u8aToHex(publicKey);
}
