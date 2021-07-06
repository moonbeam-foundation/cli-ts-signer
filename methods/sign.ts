import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import {cryptoWaitReady} from '@polkadot/util-crypto'
import prompts from "prompts";

// TODO display payload content
export async function sign( type:string, privKey:string) {
  if (!["ethereum", "sr25519"].includes(type)) {
    throw new Error("Type is not supported");
  }
  await cryptoWaitReady()
  let keyring: Keyring = new Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
  const signer: KeyringPair = keyring.addFromSeed(hexToU8a(privKey));
  const response = await prompts({
    type: 'text',
    name: 'message',
    message: 'Please enter payload',
    validate: value => true//value < 18 ? `Nightclub is 18+ only` : true
  });
  // console.log('response',response, response['message'].length) //226 for relay, 216 pr moonbeam
  const signature: Uint8Array = type === "ethereum" ? signer.sign(hexToU8a(response.message)):signer.sign(hexToU8a(response.message), { withType: true });
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
}
