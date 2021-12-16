import { Argv } from "yargs";
import { SignAndVerifyArgs, SignArgs, SignPromptArgs } from "../methods/types";
import { sign, signAndVerify } from "../methods/sign";
import { isNetworkType } from "../methods/utils";

export const signCommand = {
  command: "sign <type> <privateKey|mnemonic> <message> [derivePath]",
  describe: "sign byteCode with a private key",
  builder: (yargs: Argv) => {
    return yargs
      .positional("type", {
        describe: "type of encryption scheme (sr25519 or ethereum)",
        type: "string",
        choices: ["sr25519", "ethereum"],
        default: "ethereum",
      })
      .positional("message", {
        describe: "message to be signed",
        type: "string",
        default: "0x0",
      })
      .positional("privateKey", {
        describe: "private key or mnemonic for the signature",
        type: "string",
        default: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`,
      })
      .positional("derivePath", {
        describe: "derivation path for bip-44 (optional)",
        type: "string",
        default: `/m/44'/60'/0'/0/0`,
      });
  },
  handler: async (argv: SignArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, false, argv.derivePath, argv.message);
  },
};

// TODO this should be an optional arg
export const signPromptCommand = {
  command: "signPrompt <type> <privateKey|mnemonic> [derivePath]",
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
        describe: "private key or mnemonic for the signature",
        type: "string",
        default: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`,
      })
      .positional("derivePath", {
        describe: "derivation path for bip-44 (optional)",
        type: "string",
        default: `/m/44'/60'/0'/0/0`,
      });
  },
  handler: async (argv: SignPromptArgs) => {
    await sign(isNetworkType(argv.type), argv.privateKey, true, argv.derivePath);
  },
};

export const signAndVerifyCommand = {
  command: "signAndVerify  <type> <privateKey|mnemonic> <message> <filePath> <wsUrl> [derivePath]",
  describe: "sign byteCode with a private key and verify against payload file",
  builder: (yargs: Argv) => {
    return yargs
      .positional("type", {
        describe: "type of encryption scheme (sr25519 or ethereum)",
        type: "string",
        choices: ["sr25519", "ethereum"],
        default: "ethereum",
      })
      .positional("message", {
        describe: "message to be signed",
        type: "string",
        default: "0x0",
      })
      .positional("privateKey", {
        describe: "private key or mnemonic for the signature",
        type: "string",
        default: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`,
      })
      .positional("filePath", {
        describe: "file path of the saved extrinsic payload",
        type: "string",
        default: "payload.json"
      })
      .positional("wsUrl", {
        describe: "file path of the saved extrinsic",
        type: "string",
        default: "ok.json"
      })
      .positional("derivePath", {
        describe: "derivation path for bip-44 (optional)",
        type: "string",
        default: `/m/44'/60'/0'/0/0`,
      });
  },
  handler: async (argv: SignAndVerifyArgs) => {
    await signAndVerify(isNetworkType(argv.type), argv.privateKey, false, argv.derivePath, argv.filePath , argv.wsUrl ,argv.message);
  },
};