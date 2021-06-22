import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundle } from "moonbeam-types-bundle";
import { needParam } from "./utils";

export async function getExtrinsicData(argv:{[key:string]:string}){

      needParam("tx", "getExtrinsicData",argv);
      needParam("params", "getExtrinsicData",argv);
      needParam("ws", "getExtrinsicData",argv);
      let { tx, params, ws } = argv;
      const [section, method] = tx.split(".");
      const splitParams = params.split(",");
      const api = await ApiPromise.create({
        provider: new WsProvider(ws),
        typesBundle: typesBundle as any,
      });
      let extrinsic = await api.tx[section][method](...splitParams);
      const u8a = extrinsic.method.toU8a();
      const extrinsicHex = u8aToHex(u8a);
      const extrinsicHash = extrinsic.registry.hash(u8a).toHex();
      console.log("EXTRINSIC_HEX : " + extrinsicHex);
      console.log("EXTRINSIC_HASH : " + extrinsicHash);
}