import { Argv } from "yargs";
import { SendTxArgs } from "../methods/types";
import { submitPreSignedTx } from "../methods/submitPreSignedTx";

export const submitTxCommand = {
  command: "submitTx", //TODO: test that with getTransactionData
  description: "creates a transaction payload and resolves",
  builder: (yargs: Argv) => {
    return yargs
      .positional("txData", {
        describe: "the signed bytecode of the tx you wish to submit on chain",
        type: "string",
        default: "0x0",
      })
      .positional("ws", {
        describe: "websocket address of the endpoint on which to connect",
        type: "string",
        default: "wss://wss.testnet.moonbeam.network",
      });
  },
  handler: async (argv: SendTxArgs) => {
    return await submitPreSignedTx(argv.ws, argv.txData);
  },
};
