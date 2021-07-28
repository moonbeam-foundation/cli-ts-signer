"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signPromptCommand = exports.signCommand = void 0;
const sign_1 = require("../methods/sign");
const utils_1 = require("../methods/utils");
exports.signCommand = {
    command: "sign <type> <privateKey> <message>",
    describe: "sign byteCode with a private key",
    builder: (yargs) => {
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
    handler: async (argv) => {
        return await sign_1.sign(utils_1.isNetworkType(argv.type), argv.privateKey, false, argv.message);
    },
};
exports.signPromptCommand = {
    command: "signPrompt <type> <privateKey>",
    describe: "sign byteCode with a private key - using prompt",
    builder: (yargs) => {
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
    handler: async (argv) => {
        return await sign_1.sign(utils_1.isNetworkType(argv.type), argv.privateKey, true);
    },
};
