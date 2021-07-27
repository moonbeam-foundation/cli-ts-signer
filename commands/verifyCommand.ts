import { VerifyArgs } from "../methods/types";
import { verify } from "../methods/verify";
import { Argv } from "yargs";
import { ALITH, isNetworkType } from "../methods/utils";


export const verifyCommand = {
  command: "verify <message> <signature> <pubKey>", //TODO: this probably only works for ethereum
  description: "verify a signature",
  builder: (yargs: Argv) => {
    return yargs
      .positional("type", {
        describe: "type of encryption scheme (sr25519 or ethereum)",
        type: "string",
        choices: ["sr25519", "ethereum"],
        default: "ethereum",
      })
      .positional("message", {
        describe: "the message that is supposed to be signed",
        type: "string",
        default: "0x0",
      })
      .positional("signature", {
        describe: "signature of the message",
        type: "string",
        default: "0x0",
      })
      .positional("pubKey", {
        describe: "public key of the party who sigend",
        type: "string",
        default: ALITH,
      });
  },
  handler: (argv: VerifyArgs) => {
    verify(argv.message, argv.signature, argv.pubKey, isNetworkType(argv.type));
  },
};
