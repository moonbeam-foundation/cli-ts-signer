import { Argv } from "yargs";
import { SignArgs, SignPromptArgs } from "./types";
import { sign } from "../methods/sign";
import { isNetworkType } from "../methods/utils";

export const signOptions = {
  type: {
    describe: "type of encryption scheme (sr25519 or ethereum)",
    type: "string" as "string",
    choices: ["sr25519", "ethereum"],
    demandOption: true,
  },
  "private-key": {
    alias: "mnemonic",
    describe: "private key or mnemonic for the signature",
    type: "string" as "string",
    demandOption: true,
  },
  "derive-path": {
    describe: "derivation path for bip-44 (optional)",
    type: "string" as "string",
    default: `/m/44'/60'/0'/0/0`,
    demandOption: false,
  },
};

export const signCommand = {
  command: "sign",
  describe: "sign a transaction message or payload from a file",
  builder: (yargs: Argv) => {
    return yargs.options({
      ...signOptions,
      message: {
        describe: "message to be signed",
        type: "string" as "string",
      },
      file: {
        describe: "[RW] file to read the transaction from and write the signature to",
        type: "string" as "string",
      },
    });
  },
  handler: async (argv: SignArgs) => {
    if (!argv["private-key"]) {
      console.log(`Missing private key`);
      return;
    }
    if (!argv["type"]) {
      console.log(`Missing type`);
      return;
    }
    await sign(
      isNetworkType(argv.type),
      argv["private-key"],
      false,
      argv["derive-path"],
      argv.message,
      argv.file
    );
  },
};

export const signPromptCommand = {
  command: "signPrompt",
  describe: "sign byteCode with a private key - using prompt",
  builder: (yargs: Argv) => {
    return yargs.options(signOptions);
  },
  handler: async (argv: SignPromptArgs) => {
    if (!argv["private-key"]) {
      console.log(`Missing private key`);
      return;
    }
    if (!argv["type"]) {
      console.log(`Missing type`);
      return;
    }
    await sign(isNetworkType(argv.type), argv["private-key"], true, argv["derive-path"]);
  },
};
