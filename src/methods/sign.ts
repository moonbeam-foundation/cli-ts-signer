import { hexToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { KeypairType } from "@polkadot/util-crypto/types";
import { base58Decode, checkAddressChecksum, cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import fs from "fs";
import { NetworkType } from "./types";

import knownSubstrate from "@substrate/ss58-registry";

function getSigner(
  keyring: Keyring,
  type: NetworkType,
  privKeyOrMnemonic: string,
  derivePath: string
): KeyringPair {
  // Support both private key and mnemonic
  return privKeyOrMnemonic.substring(0, 2) === "0x"
    ? keyring.addFromSeed(hexToU8a(privKeyOrMnemonic))
    : keyring.addFromUri(
        type === "ethereum" ? privKeyOrMnemonic + derivePath : privKeyOrMnemonic,
        {},
        keyring.type
      );
}

function signFile(type: NetworkType, file: string, privKeyOrMnemonic: string, derivePath: string) {
  // Instantiate keyring

  const { payload, message } = JSON.parse(fs.readFileSync(file).toString());
  console.log(`Payload being signed: `, payload);

  let keyringType: KeypairType = type === "ethereum" ? "ethereum" : "sr25519";
  let keyring: Keyring = new Keyring({ type: keyringType });

  // Only valid for Polkadot/Substrate accounts
  let ss58Prefix: number = 0;
  let ss58Network: string = "";

  // Set SS58 format for Polkadot/Substrate accounts
  if (type === "sr25519") {
    const decoded = base58Decode(payload.address);
    const [isValid, _endPos, _ss58Length, ss58Decoded] = checkAddressChecksum(decoded);
    if (!isValid) {
      throw new Error("Invalid decoded address checksum");
    }
    ss58Prefix = ss58Decoded;
    ss58Network = knownSubstrate.find((s) => s.prefix === ss58Prefix)?.network || "unkown";
    keyring.setSS58Format(ss58Decoded);
  }

  const signer = getSigner(keyring, type, privKeyOrMnemonic, derivePath);

  if (signer.address.toLowerCase() != payload.address.toLowerCase()) {
    throw `Signer address: ${signer.address} doesn't match transaction sender: ${payload.address}`;
  }

  // Sign
  const signature: Uint8Array =
    type === "ethereum"
      ? signer.sign(hexToU8a(message))
      : signer.sign(hexToU8a(message), { withType: true });
  console.log(
    `Signature generated for account: ${signer.address}${
      type === "sr25519" ? ` (Network: ${ss58Network}[${ss58Prefix}])` : "ethereum"
    }`
  );

  fs.writeFileSync(
    file,
    JSON.stringify({ payload, message, signature: u8aToHex(signature) }, null, 2)
  );
  console.log(`Signature stored in file: ${file}`);
  console.log("SIGNATURE : " + u8aToHex(signature));
  return u8aToHex(signature);
}

export async function signMessage(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  message?: string
): Promise<string> {
  if (!prompt && !message) {
    throw new Error("sign must either provide message or use prompt");
  }

  let keyringType: KeypairType = type === "ethereum" ? "ethereum" : "sr25519";
  let keyring: Keyring = new Keyring({ type: keyringType });
  const signer = getSigner(keyring, type, privKeyOrMnemonic, derivePath);

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

  if (file) {
    return signFile(type, file, privKeyOrMnemonic, derivePath);
  }

  return signMessage(type, privKeyOrMnemonic, prompt, derivePath, message);
}
