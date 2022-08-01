import { Argv } from "yargs";
import { SendTxArgs } from "./types";
import { submitPreSignedTx } from "../methods/submitPreSignedTx";

export const submitTxCommand = {
  command: "submitTx", //TODO: test that with getTransactionData
  description: "creates a transaction payload and resolves",
  builder: (yargs: Argv) => {
    return yargs
      .positional("tx-data", {
        describe: "the signed bytecode of the tx you wish to submit on chain",
        type: "string",
      })
      .positional("ws", {
        describe: "websocket address of the endpoint on which to connect",
        type: "string",
      });
  },
  handler: async (argv: SendTxArgs) => {
    if (!argv["ws"]) {
      console.log(`Missing ws`);
      return;
    }
    if (!argv["tx-data"]) {
      console.log(`Missing tx-data`);
      return;
    }
    return await submitPreSignedTx(argv.ws, argv["tx-data"]);
  },
};
