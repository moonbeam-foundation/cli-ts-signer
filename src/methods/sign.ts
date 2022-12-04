import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { KeypairType } from "@polkadot/util-crypto/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import fs from "fs";
import { NetworkType } from "./types";

// TODO display payload content
export async function sign(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  message?: string,
  file?: string
): Promise<string> {
  if (!["ethereum", "sr25519"].includes(type)) {
    throw new Error("Type is not supported");
  }
  if (message && file) {
    throw new Error("--message incompatible with --file-in");
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

  if (file) {
    const { payload, message } = JSON.parse(fs.readFileSync(file).toString());
    console.log(`Payload being signed: `, payload);

    if (signer.address != payload.address) {
      throw `Signer address: ${signer.address} doesn't match transaction sender: ${payload.address}`;
    }

    // Sign
    const signature: Uint8Array =
      type === "ethereum"
        ? signer.sign(hexToU8a(message))
        : signer.sign(hexToU8a(message), { withType: true });
    console.log(`Signature generated for account: ${signer.address}`);

    fs.writeFileSync(
      file,
      JSON.stringify({ payload, message, signature: u8aToHex(signature) }, null, 2)
    );
    console.log(`Signature stored in file: ${file}`);
    return u8aToHex(signature);
  }

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
