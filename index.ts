import { Keyring } from "@polkadot/keyring";
import { hexToU8a, numberToHex, u8aToHex, stringToU8a } from "@polkadot/util";
import type { KeyringPair } from "@polkadot/keyring/types";
import { typesBundle } from "moonbeam-types-bundle";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { verify } from "./verify";
import { needParam } from "./utils";
import { getExtrinsicData } from "./getExtrinsicData";
import { getTransactionData } from "./getTransactionData";

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
      needParam("message", "sign", argv);
      needParam("privKey", "sign", argv);
      const signer: KeyringPair = keyring.addFromSeed(hexToU8a(argv.privKey));
      const signature: Uint8Array = signer.sign(stringToU8a(argv.message));
      console.log("SIGNATURE : " + u8aToHex(signature));
      console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
      break;
    case "verify":
      console.log("verify");
      needParam("message", "verify", argv);
      needParam("signature", "verify", argv);
      needParam("pubKey", "verify", argv);
      let pubKey = verify(argv.message, argv.signature);
      console.log("PUBKEY : " + pubKey);
      console.log("VALIDITY : " + (argv.pubKey == pubKey).toString());
      break;
    case "getExtrinsicData":
      console.log("getExtrinsicData");
      await getExtrinsicData(argv);
      break;
    case "getTransactionData":
      console.log("getTransactionData");
      await getTransactionData(argv);
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
