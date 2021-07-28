import yargs from "yargs";

import { signCommand, signPromptCommand } from "./commands/signCommand";
import { createAndSendTxCommand } from "./commands/createAndSendCommand";
import { verifyCommand } from "./commands/verifyCommand";
import { getTransactionDataCommand } from "./commands/getTransactionDataCommand";
import { submitTxCommand } from "./commands/submitTxCommand";
const { hideBin } = require("yargs/helpers");

export const cli = yargs(hideBin(process.argv))
  .command(signCommand)
  .command(signPromptCommand)
  .command(verifyCommand)
  .command(createAndSendTxCommand)
  .command(getTransactionDataCommand) // TODO: test getTransactionDataCommand and submitTxCommand
  .command(submitTxCommand)
  .help().argv;
