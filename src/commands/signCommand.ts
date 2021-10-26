import { Argv } from "yargs";
import { SignArgs, SignPromptArgs } from "../methods/types";
import { sign } from "../methods/sign";
import { isNetworkType } from "../methods/utils";

export const signCommand = {
  command: "sign <type> <privateKey> <message>", //TODO: put this into a module : https://github.com/yargs/yargs/blob/HEAD/docs/advanced.md#commands
  describe: "sign byteCode with a private key",
  builder: (yargs: Argv) => {
    return yargs
      .positional("type", {
        describe: "type of encryption scheme (sr25519 or ethereum)",
        type: "string",
        choices: ["sr25519", "ethereum"],
        default: "ethereum",
      })
      .positional("privateKey", {
        describe: "private key for the signature",
        type: "string",
        default: "0x0",
      })
      .positional("message", {
        describe: "message to be signed",
        type: "string",
        default: "0x0",
      });
  },
  handler: async (argv: SignArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, false, argv.message);
  },
};

export const signPromptCommand = {
  command: "signPrompt <type> <privateKey>", //TODO: put this into a module : https://github.com/yargs/yargs/blob/HEAD/docs/advanced.md#commands
  describe: "sign byteCode with a private key - using prompt",
  builder: (yargs: Argv) => {
    return yargs
      .positional("type", {
        describe: "type of encryption scheme (sr25519 or ethereum)",
        type: "string",
        choices: ["sr25519", "ethereum"],
        default: "ethereum",
      })
      .positional("privateKey", {
        describe: "private key for the signature",
        type: "string",
        default: "0x0",
      });
  },
  handler: async (argv: SignPromptArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, true);
  },
};
