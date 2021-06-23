import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { needParam } from "../utils";
import {cryptoWaitReady} from '@polkadot/util-crypto'

// TODO display payload content
export async function sign(argv: { [key: string]: string }) {
  needParam("message", "sign", argv);
  needParam("privKey", "sign", argv);
  needParam("type", "all functions", argv);
  if (!["ethereum", "sr25519"].includes(argv.type)) {
    throw new Error("Type is not supported");
  }
  let { type, privKey, message } = argv;
  await cryptoWaitReady()
  // TODO: check why its not the same as the signature in the app
  let keyring: Keyring = new Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
  const signer: KeyringPair = keyring.addFromSeed(hexToU8a(privKey));
  console.log("signer.address",signer.address)
  const signature: Uint8Array = signer.sign(hexToU8a(message));
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
}
