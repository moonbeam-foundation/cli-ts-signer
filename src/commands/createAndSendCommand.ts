import { Argv } from "yargs";
import { CreateAndSendArgs } from "../methods/types";
import { createAndSendTxPrompt } from "../methods/createAndSendTx";
import { exit } from "../methods/utils";
import { ALITH, authorizedChains, BALTATHAR } from "../methods/utils";

export const createTxOptions = {
  network: {
    describe: "the network on which you want to send the tx",
    type: "string" as "string",
    default: "moonbase",
    choices: authorizedChains,
    demandOption: true,
  },
  ws: {
    describe: "websocket address of the endpoint on which to connect",
    type: "string" as "string",
    default: "wss://wss.testnet.moonbeam.network",
    demandOption: true,
  },
  address: {
    describe: "address of the sender",
    type: "string" as "string",
    default: ALITH,
    demandOption: true,
  },
  tx: {
    describe: "<pallet>.<function>",
    type: "string" as "string",
    default: "balances.transfer",
    demandOption: true,
  },
  params: {
    describe: "comma separated list of parameters",
    type: "string" as "string",
    default: BALTATHAR + ",100000000000000000",
    demandOption: true,
  },
  sudo: {
    describe: "activates sudo mode",
    type: "boolean" as "boolean",
    default: false,
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
    await createAndSendTxPrompt(
      {
        tx: argv.tx,
        params: argv.params,
        address: argv.address,
        sudo: argv.sudo,
        immortality: argv.immortality,
      },
      { ws: argv.ws, network: argv.network }
    );
    exit();
  },
};
