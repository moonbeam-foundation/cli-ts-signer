import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { needParam } from "./utils";
import {cryptoWaitReady} from '@polkadot/util-crypto'
import prompts from "prompts";

// TODO display payload content
export async function sign(argv: { [key: string]: string }) {
  needParam("privKey", "sign", argv);
  needParam("type", "all functions", argv);
  if (!["ethereum", "sr25519"].includes(argv.type)) {
    throw new Error("Type is not supported");
  }
  let { type, privKey } = argv;
  await cryptoWaitReady()
  // TODO: check why its not the same as the signature in the app
  // see packages/page-signing/src/Sign.tsx in apps : its not signing the same thing
  let keyring: Keyring = new Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
  const signer: KeyringPair = keyring.addFromSeed(hexToU8a(privKey));
  console.log("signer.address",signer.address)
  const response = await prompts({
    type: 'text',
    name: 'message',
    message: 'Please enter payload',
    validate: value => true//value < 18 ? `Nightclub is 18+ only` : true
  });
  console.log('response',response, response['message'].length) //226, 216 pr moonbeam
  const signature: Uint8Array = signer.sign(hexToU8a(response.message));
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
}
