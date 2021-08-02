import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import { moonbeamChains } from "./utils";
import { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { NetworkArgs, TxArgs } from "./types";

export async function createAndSendTx(
  txArgs:TxArgs,
  networkArgs:NetworkArgs,
  signatureFunction: (payload: string) => Promise<string>,
) {
  const {tx,params,address,sudo}=txArgs
  const {ws,network}=networkArgs
  const [section, method] = tx.split(".");
  const splitParams = params.split(",");
  let api: ApiPromise;
  if (moonbeamChains.includes(network)) {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundle as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
    });
  }
  let txExtrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>;
  if (sudo) {
    txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams));
  } else {
    txExtrinsic = await api.tx[section][method](...splitParams);
  }
  const signer = {
    signPayload: (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      console.log("Transaction data to be signed : ", u8aToHex(xp.toU8a(true)));

      return new Promise<SignerResult>(async (resolve) => {
        const signature = await signatureFunction(u8aToHex(xp.toU8a(true)));
        resolve({ id: 1, signature });
      });
    },
  };
  await txExtrinsic.signAndSend(address, { signer });
  // exit();
}
export async function createAndSendTxPrompt(
  txArgs:TxArgs,
  networkArgs:NetworkArgs
) {
  return createAndSendTx(
    txArgs,
    networkArgs,
    async (payload: string) => {
      const response = await prompts({
        type: "text",
        name: "signature",
        message: "Please enter signature for + " + payload + " +",
        validate: (value) => true, // TODO: add validation
      });
      return response["signature"].trim();
    }
  );
}
