import { ApiPromise, WsProvider } from "@polkadot/api";
import { isHex, u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { SignerPayloadJSON } from "@polkadot/types/types";
import prompts from 'prompts'
import { needParam } from "../utils";
import { SignerResult } from "@polkadot/api/types";

export async function signAndSendTx(argv: { [key: string]: string }) {
  needParam("tx", "SignAndSendTx", argv);
  needParam("params", "SignAndSendTx", argv);
  needParam("ws", "SignAndSendTx", argv);
  needParam("address", "SignAndSendTx", argv);
  needParam("bc_type", "SignAndSendTx", argv);
  if (!["moonbeam", "relay"].includes(argv.bc_type)) {
    throw new Error("Blockchain Type is not supported");
  }
  let { tx, params, ws, address, bc_type } = argv;
  const [section, method] = tx.split(".");
  const splitParams = params.split(",");
  let  api :ApiPromise
  if (bc_type==="moonbeam"){
    api=await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundle as any,
    });
  } else {
    api=await ApiPromise.create({
      provider: new WsProvider(ws)
    });
  }
  let txExtrinsic = await api.tx[section][method](...splitParams);
  const signer = {
    signPayload: (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      console.log("Transaction data to be signed", u8aToHex(xp.toU8a(true)));

      return new Promise<SignerResult>(async(resolve) => {
        const response = await prompts({
          type: 'text',
          name: 'signed tx',
          message: 'Please enter signature',
          validate: value => true//value < 18 ? `Nightclub is 18+ only` : true
        });
        console.log('response',response, response['signed tx'].length)
        console.log('isHex',isHex(response['signed tx']));
        resolve({ id: 1, signature: response['signed tx'].trim() });
      });
    },
  };
  await txExtrinsic.signAndSend(address, { signer });
}
