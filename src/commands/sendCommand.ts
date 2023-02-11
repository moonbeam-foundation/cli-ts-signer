import { Argv } from "yargs";
import { sendTxPrompt } from "../methods/sendTx";
import { exit } from "../methods/utils";
import { commonArgs } from "./commonArgs";
import { Argv as NetworkArgs } from "moonbeam-tools";
import { SendArgs } from "./types";

export const sendOptions = {
  file: {
    describe: "file in which to store the transaction",
    type: "string" as "string",
    demandOption: true,
  },
  yes: {
    describe: "skip prompt for confirmation",
    type: "boolean" as "boolean",
  },
};

export const sendCommand = {
  command: "send",
  describe: "sends signed ransaction stored in a file",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...commonArgs,
      ...sendOptions,
    });
  },
  handler: async (argv: SendArgs & NetworkArgs) => {
    if (!argv["url"] && !argv["network"]) {
      console.log(`Missing url or network`);
      return;
    }
    if (!argv["file"]) {
      console.log(`Missing file`);
      return;
    }
    await sendTxPrompt(
      { url: argv.url, network: argv.network },
      { file: argv.file, yes: argv.yes || false }
    );
    exit();
  },
};
