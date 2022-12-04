import yargs from "yargs";

import { signCommand, signPromptCommand } from "./commands/signCommand";
import { createAndSendTxCommand } from "./commands/createAndSendCommand";
import { verifyCommand } from "./commands/verifyCommand";
import { voteCouncilCommand } from "./commands/voteCouncilCommand";
import { voteTechCommitteeCommand } from "./commands/voteTechCommitteeCommand";
import { createCommand } from "./commands/createCommand";
import { sendCommand } from "./commands/sendCommand";
const { hideBin } = require("yargs/helpers");

export const cli = yargs(hideBin(process.argv))
  .command(signCommand)
  .command(signPromptCommand)
  .command(voteCouncilCommand)
  .command(voteTechCommitteeCommand)
  .command(verifyCommand)
  .command(createAndSendTxCommand)
  .command(createCommand)
  .command(sendCommand)
  .demandCommand()
  .strict()
  .help().argv;
