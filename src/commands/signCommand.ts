import { Argv } from "yargs";
import { SignArgs, SignPromptArgs } from "../methods/types";
import { sign } from "../methods/sign";
import { isNetworkType } from "../methods/utils";

export const signOptions = {
  type: {
    describe: "type of encryption scheme (sr25519 or ethereum)",
    type: "string" as "string",
    choices: ["sr25519", "ethereum"],
    default: "ethereum",
    demandOption: true,
  },
  privateKey: {
    alias: "mnemonic",
    describe: "private key or mnemonic for the signature",
    type: "string" as "string",
    default: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`,
    demandOption: true,
  },
  derivePath: {
    describe: "derivation path for bip-44 (optional)",
    type: "string" as "string",
    default: `/m/44'/60'/0'/0/0`,
  },
};

export const signCommand = {
  command: "sign",
  describe: "sign byteCode with a private key",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...signOptions,
      message: {
        describe: "message to be signed",
        type: "string" as "string",
        default: "0x0",
        demandOption: true,
      },
    });
  },
  handler: async (argv: SignArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, false, argv.derivePath, argv.message);
  },
};

export const signPromptCommand = {
  command: "signPrompt <type> <privateKey|mnemonic> [derivePath]",
  describe: "sign byteCode with a private key - using prompt",
  builder: (yargs: Argv) => {
    return yargs.options(signOptions);
  },
  handler: async (argv: SignPromptArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, true, argv.derivePath);
  },
};
