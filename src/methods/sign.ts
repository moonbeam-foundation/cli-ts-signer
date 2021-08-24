import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import {
	construct,
	decode,
	deriveAddress,
	getRegistry,
	methods,
	PolkadotSS58Format,
} from '@substrate/txwrapper-polkadot';
let types = require("@polkadot/types")

import { NetworkType } from "./types";

// TODO display payload content
export async function sign(
  type: NetworkType,
  privKey: string,
  prompt: boolean,
  message?: string
): Promise<string> {
  if (!["ethereum", "sr25519"].includes(type)) {
    throw new Error("Type is not supported");
  }
  await cryptoWaitReady();

  // Instantiate keyring
  let keyring: Keyring = new Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
  const signer: KeyringPair = keyring.addFromSeed(hexToU8a(privKey));

  if (!prompt && !message) {
    throw new Error("sign must either provide message or use prompt");
  }
  
  // Get message to be signed
  const msg = message ||
    (await prompts({
        type: "text",
        name: "message",
        message: "Please enter payload",
        validate: (value) => true, // TODO: add validation
      })).message;

      let payloadInfo
      if (type === "ethereum" ){

      } else if (type === "sr25519"){

      }
      // payloadInfo = decode(msg, {
      //   metadataRpc,
      //   registry,
      // });

  // Sign
  const signature: Uint8Array =
    type === "ethereum"
      ? signer.sign(hexToU8a(msg))
      : signer.sign(hexToU8a(msg), { withType: true });
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
  return u8aToHex(signature);
}

function parseCustomType() {
  try {
    let typesObject = editor.get();

    let lastTypeKey;

    if (Array.isArray(typesObject)) {
      typesObject.map(type => {
        registry.register(type);
      });

      let lastTypeObject = typesObject[typesObject.length - 1];
      lastTypeKey = Object.keys(lastTypeObject)[0];
    } else {
      registry.register(typesObject);
      lastTypeKey = Object.keys(typesObject)[0];
    }

    output.innerText = JSON.stringify(
      types.createType(registry, lastTypeKey, rawBytes.value.trim())
    );
  } catch (e) {
    output.innerText = e;
  }
}