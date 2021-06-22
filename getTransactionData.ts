import { ApiPromise, WsProvider } from "@polkadot/api";
import { Metadata } from '@polkadot/metadata/Metadata';
import {TypeRegistry} from '@substrate/txwrapper/node_modules/@polkadot/types'
import { u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { createSigningPayload, getRegistry, methods } from "@substrate/txwrapper";
import { needParam } from "./utils";
import { SignerResult } from "@polkadot/api/types";


export async function getTransactionData(argv:{[key:string]:string}){

      needParam("tx", "getTransactionData",argv);
      needParam("params", "getTransactionData",argv);
      needParam("ws", "getTransactionData",argv);
      needParam("address", "getTransactionData",argv);
      let { tx, params, ws, address } = argv;
      const [section, method] = tx.split(".");
      const splitParams = params.split(",");
      const api = await ApiPromise.create({
        provider: new WsProvider(ws),
        typesBundle: typesBundle as any,
      });
      let txExtrinsic = await api.tx[section][method](...splitParams);
    const signer = {
      signPayload: (payload:SignerPayloadJSON) => {
        console.log('(sign)', payload);

        // create the actual payload we will be using
        const xp = txExtrinsic.registry.createType('ExtrinsicPayload', payload);
        console.log({ data: u8aToHex(xp.toU8a(true)) });
        // send to the QR with the actual resolution
        return new Promise<SignerResult>((resolve) => {
          // since this is sent as a QR, we do include the length prefix
              resolve({ id: 1, signature:"" });
          // setQrInfo({
          //   payload: xp.toU8a(),
          //   scanned: (signature) => {
          //     // log the actual data & signature (here no length prefix, actual signed)
          //     console.log({ data: u8aToHex(xp.toU8a(true)), signature });

          //     // resolve with an id and the signature as retrieved
          //     resolve({ id: 1, signature });
          //   }
          // });
        });
      }
    }
    const res = await txExtrinsic.signAsync(address, { signer });

    //   let extrinsic = await api.tx[section][method](...splitParams);
    //   const u8a = extrinsic.method.toU8a();
    //   const extrinsicHex = u8aToHex(u8a);
    //   const extrinsicHash = extrinsic.registry.hash(u8a).toHex();
    //   console.log("EXTRINSIC_HEX : " + extrinsicHex);
    //   console.log("EXTRINSIC_HASH : " + extrinsicHash);
    // const metadataRpc:Metadata=await api.rpc.state.getMetadata()
    // const nonce = (await api.query.system.account("0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d")).nonce;
    // const registry=getRegistry('Kusama','kusama',api.runtimeVersion.specVersion.toNumber())
    // const unsigned = methods.balances.transfer(
    //     {
    //       dest: "0x75531fC94c98F12FEf587f45b92a1F2DC1B72051",// Q
    //       value: 123,
    //     },
    //     {
    //       address: "0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d",
    //       blockHash:u8aToHex(api.genesisHash), //"0x1fc7493f3c1e9ac758a183839906475f8363aafb1b1d3e910fe16fab4ae1b582",
    //       blockNumber: (await api.query.system.number()).toNumber(),//4302222,
    //       genesisHash: api.genesisHash.toHex(),//"0xe3777fa922cafbff200cadeaea1a76bd7898ad5b89f7848999058b50e715f636",
    //       metadataRpc:metadataRpc.toHex(), // must import from client RPC call state_getMetadata
    //       nonce:Number(nonce),
    //       specVersion: api.runtimeVersion.specVersion.toNumber(),
    //       transactionVersion: api.runtimeVersion.transactionVersion.toNumber(),
    //     },
    //     {
    //         metadataRpc:metadataRpc.toHex(),
    //       registry//:api.rpc.state.getTypeRegistry()//.registry as TypeRegistry, // Type registry
    //     }
    //   );
    //   const signingPayload = createSigningPayload(unsigned, { registry });
    //   console.log("signingPayload",signingPayload)


}