import { ApiPromise, WsProvider } from "@polkadot/api";
import { isHex, u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { SignerPayloadJSON } from "@polkadot/types/types";
import prompts from 'prompts'
import { moonbeamChains, needParam } from "./utils";
import { SignerResult } from "@polkadot/api/types";

// TODO add sudo
export async function createAndSendTx(argv: { [key: string]: string }) {
  needParam("tx", "createAndSendTx", argv);
  needParam("params", "createAndSendTx", argv);
  needParam("ws", "createAndSendTx", argv);
  needParam("address", "createAndSendTx", argv);
  needParam("network", "createAndSendTx", argv);
  let { tx, params, ws, address, network } = argv;
  const [section, method] = tx.split(".");
  const splitParams = params.split(",");
  let  api :ApiPromise
  if (moonbeamChains.includes(network)){
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
          name: 'signature',
          message: 'Please enter signature',
          validate: value => true//value < 18 ? `Nightclub is 18+ only` : true
        });
        console.log('response',response, response['signature'].length) // 130, 132 pr moonbeam
        console.log('isHex',isHex(response['signature']));
        console.log("response['signature'].trim()",response['signature'].trim(),response['signature'].trim().length);
        resolve({ id: 1, signature: response['signature'].trim() });
      });
    },
  };
  await txExtrinsic.signAndSend(address, { signer });
}
