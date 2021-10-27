import { Argv } from "yargs";
import { VoteCouncilArgs } from "../methods/types";
import { exit } from "../methods/utils";
import { ALITH, authorizedChains } from "../methods/utils";
import { voteCouncilPrompt } from "../methods/voteCouncil";

export const voteCouncilCommand = {
  command: "voteCouncil <network> <ws> <address>",
  describe: "creates a vote council payload, prompts for signature and sends it",
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
      });
  },
  handler: async (argv: VoteCouncilArgs) => {
    await voteCouncilPrompt(argv.address, { ws: argv.ws, network: argv.network });
    exit();
  },
};
