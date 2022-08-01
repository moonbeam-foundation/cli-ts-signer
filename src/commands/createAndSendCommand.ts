import { Argv } from "yargs";
import { createAndSendTxPrompt } from "../methods/createAndSendTx";
import { exit } from "../methods/utils";
import { commonArgs } from "./commonArgs";
import { CreateAndSendArgs, NetworkArgs, TxWrapperArgs } from "./types";

export const createTxOptions = {
  address: {
    describe: "address of the sender",
    type: "string" as "string",
    demandOption: true,
  },
  tx: {
    describe: "<pallet>.<function>",
    type: "string" as "string",
    demandOption: true,
  },
  params: {
    describe: "JSON formatted Array string",
    type: "string" as "string",
    demandOption: true,
  },
  nonce: {
    describe: "nonce to use",
    type: "number" as "number",
    demandOption: false,
  },
  immortality: {
    describe: "creates an immortal transaction (doesn't expire)",
    type: "boolean" as "boolean",
    default: false,
    demandOption: false,
  },
};

export const createAndSendTxCommand = {
  command: "createAndSendTx",
  describe: "creates a transaction payload, prompts for signature and sends it",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
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
    // Moves this check to yargs
    const params = JSON.parse(argv.params);
    if (!Array.isArray(params)) {
      console.log(`Params need to be an array`);
      exit();
      return;
    }
    await createAndSendTxPrompt(
      {
        nonce: argv.nonce,
        tx: argv.tx,
        params,
        address: argv.address,
        immortality: argv.immortality,
      },
      {
        sudo: argv.sudo,
        proxy: argv["proxied-account"] ? {
          account: argv["proxied-account"],
          type: argv["proxy-type"]
        } : undefined
      },
      { ws: argv.ws, network: argv.network }
    );
    exit();
  },
};
