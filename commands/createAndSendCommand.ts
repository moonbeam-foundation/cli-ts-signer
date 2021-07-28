import { Argv } from "yargs";
console.log('process.cwd',process.cwd)
import { CreateAndSendArgs } from "../methods/types";
import { createAndSendTxPrompt } from "../methods/createAndSendtx";
import { exit } from "../methods/utils";
import { ALITH, authorizedChains, BALTATHAR } from "../methods/utils";

export const createAndSendTxCommand = {
  command: "createAndSendTx <network> <ws> <address> <tx> <params> [sudo]",
  describe: "creates a transaction payload, prompts for signature and sends it",
  builder: (yargs: Argv) => {
    return yargs
      .positional("network", {
        describe: "the network on which you want to send the tx",
        type: "string",
        default: "moonbase",
        choices: authorizedChains,
      })
      .positional("ws", {
        describe: "websocket address of the endpoint on which to connect",
        type: "string",
        default: "wss://wss.testnet.moonbeam.network",
      })
      .positional("address", {
        describe: "address of the sender",
        type: "string",
        default: ALITH,
      })
      .positional("tx", {
        describe: "<pallet>.<function>",
        type: "string",
        default: "balances.transfer",
      })
      .positional("params", {
        describe: "comma separated list of parameters",
        type: "string",
        default: BALTATHAR + ",100000000000000000",
      })
      .positional("sudo", {
        describe: "activates sudo mode",
        type: "boolean",
        default: false,
      });
  },
  handler: async (argv: CreateAndSendArgs) => {
    await createAndSendTxPrompt(
      argv.tx,
      argv.params,
      argv.ws,
      argv.address,
      argv.network,
      argv.sudo
    );
    exit();
  },
};
