"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendTxCommand = void 0;
const createAndSendTx_1 = require("../methods/createAndSendTx");
const utils_1 = require("../methods/utils");
const utils_2 = require("../methods/utils");
exports.createAndSendTxCommand = {
    command: "createAndSendTx <network> <ws> <address> <tx> <params> [sudo]",
    describe: "creates a transaction payload, prompts for signature and sends it",
    builder: (yargs) => {
        return yargs
            .positional("network", {
            describe: "the network on which you want to send the tx",
            type: "string",
            default: "moonbase",
            choices: utils_2.authorizedChains,
        })
            .positional("ws", {
            describe: "websocket address of the endpoint on which to connect",
            type: "string",
            default: "wss://wss.testnet.moonbeam.network",
        })
            .positional("address", {
            describe: "address of the sender",
            type: "string",
            default: utils_2.ALITH,
        })
            .positional("tx", {
            describe: "<pallet>.<function>",
            type: "string",
            default: "balances.transfer",
        })
            .positional("params", {
            describe: "comma separated list of parameters",
            type: "string",
            default: utils_2.BALTATHAR + ",100000000000000000",
        })
            .positional("sudo", {
            describe: "activates sudo mode",
            type: "boolean",
            default: false,
        });
    },
    handler: async (argv) => {
        await createAndSendTx_1.createAndSendTxPrompt(argv.tx, argv.params, argv.ws, argv.address, argv.network, argv.sudo);
        utils_1.exit();
    },
};
