"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCommand = void 0;
const verify_1 = require("../methods/verify");
const utils_1 = require("../methods/utils");
exports.verifyCommand = {
    command: "verify <message> <signature> <pubKey>",
    description: "verify a signature",
    builder: (yargs) => {
        return yargs
            .positional("type", {
            describe: "type of encryption scheme (sr25519 or ethereum)",
            type: "string",
            choices: ["sr25519", "ethereum"],
            default: "ethereum",
        })
            .positional("message", {
            describe: "the message that is supposed to be signed",
            type: "string",
            default: "0x0",
        })
            .positional("signature", {
            describe: "signature of the message",
            type: "string",
            default: "0x0",
        })
            .positional("pubKey", {
            describe: "public key of the party who sigend",
            type: "string",
            default: utils_1.ALITH,
        });
    },
    handler: (argv) => {
        verify_1.verify(argv.message, argv.signature, argv.pubKey, utils_1.isNetworkType(argv.type));
    },
};
