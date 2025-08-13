import { Argv } from "yargs";
import { createTx } from "../methods/createTx";
import { exit } from "../methods/utils";
import { commonArgs } from "./commonArgs";
import { Argv as NetworkArgs, ProxyChain } from "moonbeam-tools";
import { CreateArgs, TxWrapperArgs } from "./types";

export const createOptions = {
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
  "era-period": {
    describe:
      "custom mortality period in blocks (must be power of 2: 512, 1024, 2048, 4096, 8192, 16384). Default: 2048 blocks (~6.8 hours on Moonbeam). For offline batch signing, consider --immortality instead",
    type: "number" as "number",
    demandOption: false,
  },
  file: {
    describe: "file in which to store the transaction",
    type: "string" as "string",
    demandOption: true,
  },
};

export const createCommand = {
  command: "create",
  describe: "creates a transaction payload and stores it in a file",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
      ...createOptions,
    });
  },
  handler: async (argv: CreateArgs & NetworkArgs & TxWrapperArgs) => {
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
    if (!argv["url"] && !argv["network"]) {
      console.log(`Missing url or network`);
      return;
    }
    if (!argv["file"]) {
      console.log(`Missing file`);
      return;
    }
    // Moves this check to yargs
    let params;
    try {
      params = JSON.parse(argv.params);
    } catch (e) {
      console.error(`Invalid --params JSON: ${(e as Error).message}`);
      exit(1);
      return;
    }
    
    if (!Array.isArray(params)) {
      console.log(`Params need to be an array`);
      exit(1);
      return;
    }
    
    try {
      await createTx(
      {
        nonce: argv.nonce,
        tx: argv.tx,
        params,
        address: argv.address,
        immortality: argv.immortality,
        eraPeriod: argv["era-period"],
      },
      {
        sudo: argv.sudo,
        proxyChain: ProxyChain.from(argv),
      },
      { url: argv.url, network: argv.network },
      { file: argv.file }
    );
      exit();
    } catch (e) {
      console.error(`Error creating transaction: ${(e as Error).message}`);
      exit(1);
    }
  },
};
