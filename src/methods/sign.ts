import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { KeypairType } from "@polkadot/util-crypto/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import fs from 'fs'
import { TypeRegistry } from '@polkadot/types';
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

export async function signAndVerify(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  filePath:string,
  message?: string
): Promise<string> {
  console.log('message',message)
  // get the payload data from the file
	const rawdata = fs.readFileSync(filePath);
  //@ts-ignore
  const payloadFromFile = JSON.parse(rawdata);
  console.log("payloadFromFile",payloadFromFile)

  // let txExtrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>;
  // if (sudo) {
  //   txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams));
  // } else {
  //   txExtrinsic = await api.tx[section][method](...splitParams);
  // }

  const registry = new TypeRegistry();
  const extrinsicPayload = registry
        .createType('ExtrinsicPayload', payloadFromFile, { version: payloadFromFile.version })
  // create the actual payload we will be using
  // const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
  // const payloadHex=u8aToHex(xp.toU8a(true))
  console.log("Transaction data to be signed : ", extrinsicPayload);
  return sign(type,privKeyOrMnemonic,prompt,derivePath,message)
}
