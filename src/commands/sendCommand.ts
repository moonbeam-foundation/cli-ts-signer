import { Argv } from "yargs";
import fs from "fs";
import path from "path";
import { sendTxPrompt } from "../methods/sendTx";
import { exit } from "../methods/utils";
import { commonArgs } from "./commonArgs";
import { Argv as NetworkArgs } from "moonbeam-tools";
import { SendArgs } from "./types";

export const sendOptions = {
  file: {
    describe: "path to a signed transaction file (repeatable or directory)",
    type: "string" as "string",
    demandOption: true,
    array: true,
  },
  yes: {
    describe: "skip prompt for confirmation",
    type: "boolean" as "boolean",
  },
};

export const sendCommand = {
  command: "send",
  describe: "sends signed transaction stored in a file",
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

    const fileInputs = Array.isArray(argv.file) ? argv.file : [argv.file];
    let filesToSend: string[] = [];

    for (const input of fileInputs) {
      const resolved = path.resolve(input);

      if (!fs.existsSync(resolved)) {
        console.error(`File or directory not found: ${input}`);
        return;
      }

      const stats = fs.statSync(resolved);

      if (stats.isDirectory()) {
        const childFiles = fs
          .readdirSync(resolved)
          .map((child) => path.join(resolved, child))
          .filter((childPath) => fs.statSync(childPath).isFile())
          .sort();
        filesToSend = filesToSend.concat(childFiles);
      } else if (stats.isFile()) {
        filesToSend.push(resolved);
      } else {
        console.error(`Unsupported path type: ${input}`);
        return;
      }
    }

    if (filesToSend.length === 0) {
      console.log(`No transaction files found to send`);
      return;
    }

    const yes = argv.yes ?? false;

    for (let index = 0; index < filesToSend.length; index++) {
      const filePath = filesToSend[index];
      console.log(`Sending transaction ${index + 1} of ${filesToSend.length}: ${filePath}`);
      await sendTxPrompt({ url: argv.url, network: argv.network }, { file: filePath, yes });
    }

    exit();
  },
};
