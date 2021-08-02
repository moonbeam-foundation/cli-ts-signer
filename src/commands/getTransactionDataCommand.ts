import { Argv } from "yargs";
import { CreateAndSendArgs } from "../methods/types";
import { ALITH, authorizedChains, BALTATHAR } from "../methods/utils";
import { getTransactionData } from "../methods/getTransactionData";

export const getTransactionDataCommand = {
  command: "getTransactionData <network> <ws> <address> <tx> <params> [sudo]",
  description: "creates a transaction payload and resolves",
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
    return await getTransactionData(
      {tx:argv.tx,
      params:argv.params,
      address:argv.address,
      sudo:argv.sudo},
      {ws:argv.ws,
      network:argv.network},
    );
  },
};
