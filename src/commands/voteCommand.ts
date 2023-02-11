import { Argv } from "yargs"; // Command Args
import { exit } from "../methods/utils";
import { votePrompt } from "../methods/vote";
import { commonArgs } from "./commonArgs";
import { Argv as NetworkArgs, ProxyChain } from "moonbeam-tools";
import { TxWrapperArgs, VoteArgs } from "./types";

export const specificTxArgs = {
  address: {
    describe: "address of the sender",
    type: "string" as "string",
    demandOption: true,
  },
  file: {
    describe: "file in which to store the transaction",
    type: "string" as "string",
    demandOption: true,
  },
};

export const voteCommand = {
  command: "vote",
  describe: "creates a vote payload, prompts for signature and sends it",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
      ...specificTxArgs,
    });
  },
  handler: async (argv: VoteArgs & NetworkArgs & TxWrapperArgs) => {
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
    await votePrompt(
      argv.address,
      {
        sudo: argv.sudo,
        proxyChain: ProxyChain.from(argv),
      },
      { url: argv.url, network: argv.network },
      { file: argv.file }
    );
    exit();
  },
};
