import { Argv } from "yargs";
import { VerifyArgs } from "../methods/types";
import { verify } from "../methods/verify";
import { ALITH, isNetworkType } from "../methods/utils";

export const verifyOptions = {
  type: {
    describe: "type of encryption scheme (sr25519 or ethereum)",
    type: "string" as "string",
    choices: ["sr25519", "ethereum"],
    default: "ethereum",
    demandOption: true,
  },
  message: {
    describe: "the message that is supposed to be signed",
    type: "string" as "string",
    default: "0x0",
    demandOption: true,
  },
  signature: {
    describe: "signature of the message",
    type: "string" as "string",
    default: "0x0",
    demandOption: true,
  },
  pubKey: {
    describe: "public key of the party who sigend",
    type: "string" as "string",
    default: ALITH,
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
    verify(argv.message, argv.signature, argv.pubKey, isNetworkType(argv.type));
  },
};
