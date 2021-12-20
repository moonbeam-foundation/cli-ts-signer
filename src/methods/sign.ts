import { hexToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { KeypairType } from "@polkadot/util-crypto/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import { NetworkType } from "./types";


export async function sign(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  message?: string
): Promise<string> {
  if (!["ethereum", "sr25519"].includes(type)) {
    throw new Error("Type is not supported");
  }
  await cryptoWaitReady();
  // Instantiate keyring
  let keyringType: KeypairType = type === "ethereum" ? "ethereum" : "sr25519";
  let keyring: Keyring = new Keyring({ type: keyringType });

  // Support both private key and mnemonic
  const signer: KeyringPair =
    privKeyOrMnemonic.substring(0, 2) === "0x"
      ? keyring.addFromSeed(hexToU8a(privKeyOrMnemonic))
      : keyring.addFromUri(
          type === "ethereum" ? privKeyOrMnemonic + derivePath : privKeyOrMnemonic,
          {},
          keyringType
        );

  if (!prompt && !message) {
    throw new Error("sign must either provide message or use prompt");
  }

  // Get message to be signed
  const msg =
    message ||
    (
      await prompts({
        type: "text",
        name: "message",
        message: "Please enter payload",
        validate: (value) => true, // TODO: add validation
      })
    ).message;

  // Sign
  const signature: Uint8Array =
    type === "ethereum"
      ? signer.sign(hexToU8a(msg))
      : signer.sign(hexToU8a(msg), { withType: true });
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
  return u8aToHex(signature);
}