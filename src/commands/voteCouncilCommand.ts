import { Argv } from "yargs";
import { exit } from "../methods/utils";
import { voteCouncilPrompt } from "../methods/voteCouncil";
import { commonArgs } from "./commonArgs";
import { NetworkArgs, TxWrapperArgs, VoteCouncilArgs } from "./types";

export const specificTxArgs = {
  address: {
    describe: "address of the sender",
    type: "string" as "string",
    demandOption: true,
  },
};

export const voteCouncilCommand = {
  command: "voteCouncil",
  describe: "creates a vote council payload, prompts for signature and sends it",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
      ...specificTxArgs,
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
    await voteCouncilPrompt(
      argv.address,
      {
        sudo: argv.sudo,
        proxy: argv["proxied-account"]
          ? {
              account: argv["proxied-account"],
              type: argv["proxy-type"],
            }
          : undefined,
      },
      { ws: argv.ws, network: argv.network }
    );
    exit();
  },
};
