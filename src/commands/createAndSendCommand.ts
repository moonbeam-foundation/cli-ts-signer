import { Argv } from "yargs";
import { CreateAndSendArgs } from "../methods/types";
import { createAndSendTxPrompt } from "../methods/createAndSendTx";
import { exit } from "../methods/utils";
import { ALITH, authorizedChains, BALTATHAR } from "../methods/utils";

export const createTxOptions = {
  network: {
    describe: "the network on which you want to send the tx",
    type: "string" as "string",
    choices: authorizedChains,
    demandOption: true,
  },
  ws: {
    describe: "websocket address of the endpoint on which to connect",
    type: "string" as "string",
    demandOption: true,
  },
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
  sudo: {
    describe: "activates sudo mode",
    type: "boolean" as "boolean",
    default: false,
    demandOption: false,
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
        sudo: argv.sudo,
        immortality: argv.immortality,
      },
      { ws: argv.ws, network: argv.network }
    );
    exit();
  },
};
