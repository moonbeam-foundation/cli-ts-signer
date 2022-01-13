import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import Keyring from "@polkadot/keyring";
import { blake2AsHex } from "@polkadot/util-crypto";

import { moonbeamChains } from "./utils";
import { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { NetworkArgs, TxArgs, TxParam } from "./types";

export async function createAndSendTx(
  txArgs: TxArgs,
  networkArgs: NetworkArgs,
  signatureFunction: (payload: string) => Promise<`0x${string}`>
) {
  const { tx, params, address, sudo, nonce } = txArgs;
  const { ws, network } = networkArgs;
  const [section, method] = tx.split(".");

  let api: ApiPromise;
  if (moonbeamChains.includes(network)) {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundlePre900 as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
    });
  }
  let txExtrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>;
  if (sudo) {
    txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...params));
  } else {
    txExtrinsic = await api.tx[section][method](...params);
  }
  const signer = {
    signPayload: (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex = u8aToHex(xp.toU8a(true));
      console.log("Transaction data to be signed : ", payloadHex);

      const hashed = payloadHex.length > (256 + 1) * 2 ? blake2AsHex(payloadHex) : payloadHex;
      return new Promise<SignerResult>(async (resolve) => {
        const signature = await signatureFunction(hashed);
        resolve({ id: 1, signature });
      });
    },
  };
  let options = txArgs.immortality ? { signer, era: 0, nonce } : { signer, nonce };

  const keyring = new Keyring({ type: "ethereum" });
  const genesisAccount = await keyring.addFromUri(
    "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133",
    undefined,
    "ethereum"
  );
  let res = await txExtrinsic.sign(genesisAccount);
  // Only resolve when it's finalised
  await new Promise<void>((resolve, reject) => {
    txExtrinsic.signAndSend(address, options, ({ events = [], status }) => {
      console.log("Transaction status:", status.type);

      if (status.isInBlock) {
        console.log("Included at block hash", status.asInBlock.toHex());
        resolve();
      } else if (status.isFinalized) {
        console.log("Finalized block hash", status.asFinalized.toHex());
        resolve();
      } else if (status.isDropped || status.isInvalid || status.isRetracted) {
        console.log(
          "There was a problem with the extrinsic, status : ",
          status.isDropped ? "Dropped" : status.isInvalid ? "isInvalid" : "isRetracted"
        );
        resolve();
      }
    });
  });
}
export async function createAndSendTxPrompt(txArgs: TxArgs, networkArgs: NetworkArgs) {
  return createAndSendTx(txArgs, networkArgs, async (payload: string) => {
    const response = await prompts({
      type: "text",
      name: "signature",
      message: "Please enter signature for + " + payload + " +",
      validate: (value) => true, // TODO: add validation
    });
    return response["signature"].trim();
  });
}
