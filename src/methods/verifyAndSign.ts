import {
  u8aToHex,
} from "@polkadot/util";
import fs from "fs";
import { Metadata, TypeRegistry } from "@polkadot/types";
import { NetworkType, PayloadVerificationInfo, RegistryPersistantInfo } from "./types";

import { sign } from "./sign";
import { initRegistry } from "./registryUtils";


export async function verifyAndSign(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  filePath: string,
  message: string
): Promise<`0x${string}`> {
  // get the payload data from the file
  const rawdata = fs.readFileSync(filePath);
  const payloadVerifInfoFromFile: PayloadVerificationInfo = JSON.parse(rawdata as any);

  // Recreate registry
  const registry = new TypeRegistry();
  await initRegistry(registry, payloadVerifInfoFromFile.registryInfo);

  // Check the payload against payload info
  const hexFromSimpleRegistry = u8aToHex(
    registry
      .createType("ExtrinsicPayload", payloadVerifInfoFromFile.payload, {
        version: payloadVerifInfoFromFile.payload.version,
      })
      .toU8a(true)
  );

  if (hexFromSimpleRegistry !== message) {
    throw new Error("Payload is not matching payload in filepath");
  }

  return sign(type, privKeyOrMnemonic, prompt, derivePath, message);
}
