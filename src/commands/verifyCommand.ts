import { Argv } from "yargs";
import { VerifyArgs } from "./types";
import { verify } from "../methods/verify";
import { isNetworkType } from "../methods/utils";

export const verifyOptions = {
  type: {
    describe: "type of encryption scheme (sr25519 or ethereum)",
    type: "string" as "string",
    choices: ["sr25519", "ethereum"],
    demandOption: true,
  },
  message: {
    describe: "the message that is supposed to be signed",
    type: "string" as "string",
    demandOption: true,
  },
  signature: {
    describe: "signature of the message",
    type: "string" as "string",
    demandOption: true,
  },
  "public-key": {
    describe: "public key of the party who sigend",
    type: "string" as "string",
    demandOption: true,
  },
};

export const verifyCommand = {
  command: "verify", //TODO: this probably only works for ethereum
  description: "verify a signature",
  builder: (yargs: Argv) => {
    return yargs.options(verifyOptions);
  },
  handler: (argv: VerifyArgs) => {
    if (!argv["message"]) {
      console.log(`Missing message`);
      return;
    }
    if (!argv["signature"]) {
      console.log(`Missing signature`);
      return;
    }
    if (!argv["type"]) {
      console.log(`Missing type`);
      return;
    }
    if (!argv["public-key"]) {
      console.log(`Missing public-key`);
      return;
    }
    verify(argv.message, argv.signature, argv["public-key"], isNetworkType(argv.type));
  },
};
