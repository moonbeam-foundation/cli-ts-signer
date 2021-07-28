import { ethereumEncode } from "@polkadot/util-crypto";
import { NetworkType } from "./types";
import { verifyFromPolkadotJs } from "./verifyFromPolkadotJs";

export async function verify(
  message: string,
  signature: string,
  pubKey: string,
  type: NetworkType
) {
  let publicKey = verifyFromPolkadotJs(message, signature);
  if (type === "ethereum") {
    publicKey = ethereumEncode(publicKey);
  }
  console.log("PUBKEY : " + pubKey);
  console.log("VALIDITY : " + (pubKey == publicKey).toString());
}
