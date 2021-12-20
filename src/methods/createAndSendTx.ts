import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import fs from 'fs'
import { moonbeamChains } from "./utils";
import { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { NetworkArgs, PayloadVerificationInfo, RegistryPersistantInfo, TxArgs, TxParam } from "./types";

export const getRegistryInfo=async(api:ApiPromise):Promise<RegistryPersistantInfo>=>{

  const [runtimeVersion, chain, chainProps, chainMetadata] = await Promise.all([
    (api.rpc.state.getRuntimeVersion()),
    (api.rpc.system.chain()),
    (api.rpc.system.properties()),
    api.rpc.state.getMetadata()
  ]);
  return{
      runtimeVersion:{specName:runtimeVersion.specName.toString(),specVersion:Number(runtimeVersion.specVersion)},
      chainName:chain.toString(),
      chainProps:{ss58Format:chainProps.ss58Format.toString(),tokenSymbol:chainProps.tokenSymbol.toString(),tokenDecimals:chainProps.tokenDecimals.toString()} ,
      metadataHex:chainMetadata.toHex()
  }
}

export async function createAndSendTx(
  txArgs: TxArgs,
  networkArgs: NetworkArgs,
  signatureFunction: (payload: string, filePath:string) => Promise<`0x${string}`>
) {
  const { tx, params, address, sudo } = txArgs;
  const { ws, network } = networkArgs;
  const [section, method] = tx.split(".");
  const splitParams: TxParam[] = Array.isArray(params)
    ? (params as TxParam[])
    : (params as string).split(",");

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
    txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams));
  } else {
    txExtrinsic = await api.tx[section][method](...splitParams);
  }
  const signer = {
    signPayload:async (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex=u8aToHex(xp.toU8a(true))
      console.log("Transaction data to be signed : ", payloadHex);
      
      // save tx data in a file
      const payloadData:PayloadVerificationInfo={
        payload,
        registryInfo:await getRegistryInfo(api)
      }
      const data = JSON.stringify(payloadData, null, 2);
      const filePath:string=`payload-${payloadHex.substring(0,10)}...${payloadHex.substring(payloadHex.length-10,payloadHex.length)}.json`
      fs.writeFileSync(filePath, data);

      return new Promise<SignerResult>(async (resolve) => {
        const signature = await signatureFunction(payloadHex,filePath);
        resolve({ id: 1, signature });
      });
    },
  };
  let options = txArgs.immortality ? { signer, era: 0 } : { signer };

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
