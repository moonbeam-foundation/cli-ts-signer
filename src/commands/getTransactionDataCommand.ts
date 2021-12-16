import { Argv } from "yargs";
import { CreateAndSendArgs } from "../methods/types";
import { getTransactionData } from "../methods/getTransactionData";
import { createTxOptions } from "./createAndSendCommand";

export const getTransactionDataCommand = {
  command: "getTransactionData",
  description: "creates a transaction payload and resolves",
  builder: (yargs: Argv) => {
    return yargs.options(createTxOptions);
  },
  handler: async (argv: CreateAndSendArgs) => {
    return await getTransactionData(
      { tx: argv.tx, params: argv.params, address: argv.address, sudo: argv.sudo },
      { ws: argv.ws, network: argv.network }
    );
  },
};
