import { Argv } from "yargs";
import { CreateAndSendArgs } from "../methods/types";
import { getTransactionData } from "../methods/getTransactionData";
import { createTxOptions } from "./createAndSendCommand";
import { checkArgvList } from "../methods/utils";

export const getTransactionDataCommand = {
  command: "getTransactionData",
  description: "creates a transaction payload and resolves",
  builder: (yargs: Argv) => {
    return yargs.options(createTxOptions);
  },
  handler: async (argv: CreateAndSendArgs) => {
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
      { tx: argv.tx, params: JSON.parse(argv.params), address: argv.address, sudo: argv.sudo },
      { ws: argv.ws, network: argv.network }
    );
  },
};
