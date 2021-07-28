"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTxCommand = void 0;
const submitPreSignedTx_1 = require("../methods/submitPreSignedTx");
exports.submitTxCommand = {
    command: "submitTx <ws> <txData>",
    description: "creates a transaction payload and resolves",
    builder: (yargs) => {
        return yargs
            .positional("txData", {
            describe: "the signed bytecode of the tx you wish to submit on chain",
            type: "string",
            default: "0x0",
        })
            .positional("ws", {
            describe: "websocket address of the endpoint on which to connect",
            type: "string",
            default: "wss://wss.testnet.moonbeam.network",
        });
    },
    handler: async (argv) => {
        return await submitPreSignedTx_1.submitPreSignedTx(argv.ws, argv.txData);
    },
};
