import "@moonbeam-network/api-augment";
import yargs from "yargs";

import { signCommand, signPromptCommand } from "./commands/signCommand";
import { createAndSendTxCommand } from "./commands/createAndSendCommand";
import { verifyCommand } from "./commands/verifyCommand";
import { voteCommand } from "./commands/voteCommand";
import { licenseCommand, licenseMiddleware } from "./commands/licenseCommand";
import { createCommand } from "./commands/createCommand";
import { sendCommand } from "./commands/sendCommand";
const { hideBin } = require("yargs/helpers");

export const cli = yargs(hideBin(process.argv))
  .middleware(licenseMiddleware, true)
  .command(licenseCommand)
  .command(signCommand)
  .command(signPromptCommand)
  .command(voteCommand)
  .command(verifyCommand)
  .command(createAndSendTxCommand)
  .command(createCommand)
  .command(sendCommand)
  .demandCommand()
  .strict()
  .help().argv;
