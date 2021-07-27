import yargs from "yargs";

import { authorizedChains } from "./methods/utils";
import { getTransactionData } from "./methods/getTransactionData";
import { sign } from "./methods/sign";
import { verify } from "./methods/verify";
import { createAndSendTx } from "./methods/createAndSendTx";
import { submitPreSignedTx } from "./methods/submitPreSignedTx";
import { CreateAndSendArgs, SendTxArgs, SignArgs, VerifyArgs } from "./methods/types";
import {signCommand, signPromptCommand} from './commands/signCommand'
const { hideBin } = require("yargs/helpers");

export const cli = yargs(hideBin(process.argv))
  .command(
    signCommand
  )
  .command(
    signPromptCommand
  )
  .command(
    "verify <message> <signature> <pubKey>", //TODO: this probably only works for ethereum
    "verify a signature",
    (yargs) => {
      yargs
        .positional("message", {
          describe: "the message that is supposed to be signed",
          type: "string",
        })
        .positional("signature", {
          describe: "signature of the message",
          type: "string",
        })
        .positional("pubKey", {
          describe: "public key of the party who sigend",
          type: "string",
        });
    },
    (argv: VerifyArgs) => {
      verify(argv.message, argv.signature, argv.pubKey);
    }
  )
  .command(
    "createAndSendTx <network> <ws> <address> <tx> <params> [sudo]",
    "creates a transaction payload, prompts for signature and sends it",
    (yargs) => {
      yargs
        .positional("network", {
          describe: "the network on which you want to send the tx",
          type: "string",
          default: "moonbase",
          choices: authorizedChains,
        })
        .positional("ws", {
          describe: "websocket address of the endpoint on which to connect",
          type: "string",
          default: "wss://wss.testnet.moonbeam.network",
        })
        .positional("address", {
          describe: "address of the sender",
          type: "string",
        })
        .positional("tx", {
          describe: "<pallet>.<function>",
          type: "string",
        })
        .positional("params", {
          describe: "comma separated list of parameters",
          type: "string",
        })
        .positional("sudo", {
          describe: "activates sudo mode",
          type: "boolean",
        });
    },
    (argv: CreateAndSendArgs) => {
      createAndSendTx(argv.tx, argv.params, argv.ws, argv.address, argv.network, argv.sudo);
    }
  )
  .command(
    "getTransactionData <network> <ws> <address> <tx> <params> [sudo]",
    "creates a transaction payload and resolves",
    (yargs) => {
      yargs
        .positional("network", {
          describe: "the network on which you want to send the tx",
          type: "string",
          default: "moonbase",
          choices: authorizedChains,
        })
        .positional("ws", {
          describe: "websocket address of the endpoint on which to connect",
          type: "string",
          default: "wss://wss.testnet.moonbeam.network",
        })
        .positional("address", {
          describe: "address of the sender",
          type: "string",
        })
        .positional("tx", {
          describe: "<pallet>.<function>",
          type: "string",
        })
        .positional("params", {
          describe: "comma separated list of parameters",
          type: "string",
        })
        .positional("sudo", {
          describe: "activates sudo mode",
          type: "boolean",
        });
    },
    (argv: CreateAndSendArgs) => {
      getTransactionData(argv.tx, argv.params, argv.ws, argv.address, argv.network, argv.sudo);
    }
  )
  .command(
    "submitTx <ws> <txData>", //TODO: test that with getTransactionData
    "creates a transaction payload and resolves",
    (yargs) => {
      yargs
        .positional("txData", {
          describe: "the signed bytecode of the tx you wish to submit on chain",
          type: "string",
        })
        .positional("ws", {
          describe: "websocket address of the endpoint on which to connect",
          type: "string",
          default: "wss://wss.testnet.moonbeam.network",
        });
    },
    (argv: SendTxArgs) => {
      submitPreSignedTx(argv.ws, argv.txData);
    }
  )
  .help().argv;
