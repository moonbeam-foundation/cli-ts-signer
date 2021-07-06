import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types";
import { exit, moonbeamChains } from "./utils";
import { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";

export async function getTransactionData(tx:string, params:string, ws:string, address:string, network:string, sudo:boolean|undefined) {
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
  let txExtrinsic :SubmittableExtrinsic<"promise", ISubmittableResult>
  if (sudo){
    txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams)) ;
  } else {
    txExtrinsic = await api.tx[section][method](...splitParams);
  }
  const signer = {
    signPayload: (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      console.log("Transaction data to be signed", u8aToHex(xp.toU8a(true)));

      return new Promise<SignerResult>((resolve) => {
        resolve({ id: 1, signature: "" });
      });
    },
  };
  await txExtrinsic.signAsync(address, { signer });
  exit()
}
