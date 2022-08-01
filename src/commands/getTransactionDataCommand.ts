import { Argv } from "yargs";
import { getTransactionData } from "../methods/getTransactionData";
import { createTxOptions } from "./createAndSendCommand";
import { commonNetworkArgs } from "./commonArgs";
import { CreateAndSendArgs, NetworkArgs, TxWrapperArgs } from "./types";

export const getTransactionDataCommand = {
  command: "getTransactionData",
  description: "creates a transaction payload and resolves",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonNetworkArgs,
      ...createTxOptions
    });
  },
  handler: async (argv: CreateAndSendArgs & NetworkArgs & TxWrapperArgs) => {
    if (!argv["params"]) {
      console.log(`Missing params`);
      return;
    }
    if (!argv["tx"]) {
      console.log(`Missing tx`);
      return;
    }
    if (!argv["address"]) {
      console.log(`Missing address`);
      return;
    }
    if (!argv["ws"]) {
      console.log(`Missing ws`);
      return;
    }
    if (!argv["network"]) {
      console.log(`Missing network`);
      return;
    }
    return await getTransactionData(
      { tx: argv.tx, params: JSON.parse(argv.params), address: argv.address },
      { sudo: argv.sudo, proxy: argv["proxied-account"] ? { account: argv["proxied-account"], type: argv["proxy-type"] } : undefined },
      { ws: argv.ws, network: argv.network }
    );
  },
};
