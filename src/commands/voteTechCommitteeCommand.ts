import { Argv } from "yargs";
import { voteTechCommitteePrompt } from "../methods/voteTechCommittee";
import { specificTxArgs } from "./voteCouncilCommand";
import { exit } from "../methods/utils";
import { commonArgs } from "./commonArgs";
import { NetworkArgs, TxWrapperArgs, VoteCouncilArgs } from "./types";

export const voteTechCommitteeCommand = {
  command: "voteTechCommittee",
  describe: "creates a tech committee vote payload, prompts for signature and sends it",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
      ...specificTxArgs
    });
  },
  handler: async (argv: VoteCouncilArgs & NetworkArgs & TxWrapperArgs) => {
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
    await voteTechCommitteePrompt(argv.address, {
      sudo: argv.sudo,
      proxy: argv["proxied-account"] ? {
        account: argv["proxied-account"],
        type: argv["proxy-type"]
      } : undefined
    }, { ws: argv.ws, network: argv.network });
    exit();
  },
};
