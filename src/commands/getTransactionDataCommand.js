"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionDataCommand = void 0;
const utils_1 = require("../methods/utils");
const getTransactionData_1 = require("../methods/getTransactionData");
exports.getTransactionDataCommand = {
    command: "getTransactionData <network> <ws> <address> <tx> <params> [sudo]",
    description: "creates a transaction payload and resolves",
    builder: (yargs) => {
        return yargs
            .positional("network", {
            describe: "the network on which you want to send the tx",
            type: "string",
            default: "moonbase",
            choices: utils_1.authorizedChains,
        })
            .positional("ws", {
            describe: "websocket address of the endpoint on which to connect",
            type: "string",
            default: "wss://wss.testnet.moonbeam.network",
        })
            .positional("address", {
            describe: "address of the sender",
            type: "string",
            default: utils_1.ALITH,
        })
            .positional("tx", {
            describe: "<pallet>.<function>",
            type: "string",
            default: "balances.transfer",
        })
            .positional("params", {
            describe: "comma separated list of parameters",
            type: "string",
            default: utils_1.BALTATHAR + ",100000000000000000",
        })
            .positional("sudo", {
            describe: "activates sudo mode",
            type: "boolean",
            default: false,
        });
    },
    handler: async (argv) => {
        return await getTransactionData_1.getTransactionData(argv.tx, argv.params, argv.ws, argv.address, argv.network, argv.sudo);
    },
};
