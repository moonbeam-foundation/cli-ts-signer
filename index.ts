import { typesBundle } from "moonbeam-types-bundle";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { needParam } from "./utils";
import { getExtrinsicData } from "./methods/getExtrinsicData";
import { getTransactionData } from "./methods/getTransactionData";
import { sign } from "./methods/sign";
import { verify } from "./methods/verify";
import { signAndSendTx } from "./methods/signAndSendTx";

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
  })
  .option("address", {
    string: true,
  }).argv;

function exit() {
  process.exit();
}

function submitPreSignedTx(api: ApiPromise, tx: string): void {
  const extrinsic = api.createType("Extrinsic", tx);

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  api.rpc.author.submitAndWatchExtrinsic(extrinsic, (result) => {
    console.log(JSON.stringify(result.toHuman(), null, 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}

async function main() {
  switch (argv._[0]) {
    case "sign":
      console.log("sign");
      await sign(argv);
      break;
    case "verify":
      console.log("verify");
      await verify(argv)
      break;
    case "getExtrinsicData":
      console.log("getExtrinsicData");
      await getExtrinsicData(argv);
      break;
    case "getTransactionData":
      console.log("getTransactionData");
      await getTransactionData(argv);
      break;
    case "signAndSendTx":
      console.log("signAndSendTx");
      await signAndSendTx(argv);
      break;
    case "submitTx":
      console.log("submitTx");
      needParam("tx", "submitTx", argv);
      needParam("ws", "submitTx", argv);
      const { tx, ws } = argv;
      const api = await ApiPromise.create({
        provider: new WsProvider(ws),
        typesBundle: typesBundle as any,
      });
      submitPreSignedTx(api, tx);
      break;
    default:
      console.log(`function not recognized`);
  }
  exit();
}
main();
