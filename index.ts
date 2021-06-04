import { Keyring } from "@polkadot/keyring";
import { hexToU8a, numberToHex, u8aToHex, stringToU8a } from "@polkadot/util";
import type { KeyringPair } from "@polkadot/keyring/types";
import { typesBundle } from "moonbeam-types-bundle";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { verify } from "./verify";

const { hideBin } = require("yargs/helpers");
const argv = require("yargs/yargs")(hideBin(process.argv))
  .option("signature", {
    string: true,
  })
  .option("privKey", {
    string: true,
  })
  .option("pubKey", {
    string: true,
  }).argv;

function needParam(key: string, functionName: string) {
  if (!argv[key]) {
    throw new Error(key + " parameter is required for " + functionName);
  }
}

function exit(){
  process.exit()
}

async function main(){
  let keyring: Keyring;
  switch (argv.type) {
    case "ethereum":
      keyring = new Keyring({ type: "ethereum" });
      break;
    default:
      console.log("type defaults to ethereum");
      keyring = new Keyring({ type: "ethereum" });
  }
  
  switch (argv._[0]) {
    case "sign":
      console.log("sign");
      needParam("message", "sign");
      needParam("privKey", "sign");
      const signer: KeyringPair = keyring.addFromSeed(hexToU8a(argv.privKey));
      const signature: Uint8Array = signer.sign(stringToU8a(argv.message));
      console.log("SIGNATURE : " + u8aToHex(signature));
      console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
      break;
    case "verify":
      console.log("verify");
      needParam("message", "verify");
      needParam("signature", "verify");
      needParam("pubKey", "verify");
      let pubKey = verify(argv.message, argv.signature);
      console.log("PUBKEY : " + pubKey);
      console.log("VALIDITY : " + (argv.pubKey == pubKey).toString());
      break;
    case "getExtrinsicData":
        console.log("getExtrinsicData");
        needParam("tx", "getExtrinsicData");
        needParam("params", "getExtrinsicData");
        needParam("ws", "getExtrinsicData");
        const {tx,params,ws}=argv
        const [section, method] = tx.split('.');
        const splitParams=params.split(',');
        const api = await ApiPromise.create({ provider: new WsProvider(ws),
          typesBundle: typesBundle as any, });
        let extrinsic=await api.tx[section][method](...splitParams)
        const u8a = extrinsic.method.toU8a();
        const extrinsicHex=u8aToHex(u8a)
        const extrinsicHash=extrinsic.registry.hash(u8a).toHex()
        console.log("EXTRINSIC_HEX : " + extrinsicHex);
        console.log("EXTRINSIC_HASH : " + extrinsicHash);
        break;
    default:
      console.log(`function not recognized`);
  }
  exit()
}
main()