import yargs from "yargs";

import { authorizedChains } from "./methods/utils";
import { getTransactionData } from "./methods/getTransactionData";
import { sign } from "./methods/sign";
import { verify } from "./methods/verify";
import { createAndSendTx } from "./methods/createAndSendTx";
import { submitPreSignedTx } from "./methods/submitPreSignedTx";
import { CreateAndSendArgs, SendTxArgs, SignArgs, VerifyArgs } from "./methods/types";
const { hideBin } = require("yargs/helpers");
console.log('ooooo')
// async function main (){
console.log('main')
yargs(hideBin(process.argv))
  .command(
    "sign <type> <privateKey>", //TODO: put this into a module : https://github.com/yargs/yargs/blob/HEAD/docs/advanced.md#commands
    "sign byteCode with a private key",
    (yargs:any) => {
      yargs
        .positional("type", {
          describe: "type of encryption scheme (sr25519 or ethereum)",
          type: "string",
          choices: ["sr25519", "ethereum"],
          default: "ethereum",
        })
        .positional("privateKey", {
          describe: "private key for the signature",
          type: "string",
        });
    },
    (argv: SignArgs) => {
      sign(argv.type, argv.privateKey);
    }
  )
  .command(
    "verify <message> <signature> <pubKey>", //TODO: this probably only works for ethereum
    "verify a signature",
    (yargs:any) => {
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
    (yargs:any) => {
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
    (yargs:any) => {
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
    (yargs:any) => {
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
  console.log('end main')
  // await new Promise((res)=>setTimeout(res,10000))
  //   console.log('end')
// }
// main()
