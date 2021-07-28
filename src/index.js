"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const yargs_1 = __importDefault(require("yargs"));
const signCommand_1 = require("./commands/signCommand");
const createAndSendCommand_1 = require("./commands/createAndSendCommand");
const verifyCommand_1 = require("./commands/verifyCommand");
const getTransactionDataCommand_1 = require("./commands/getTransactionDataCommand");
const submitTxCommand_1 = require("./commands/submitTxCommand");
const { hideBin } = require("yargs/helpers");
exports.cli = yargs_1.default(hideBin(process.argv))
    .command(signCommand_1.signCommand)
    .command(signCommand_1.signPromptCommand)
    .command(verifyCommand_1.verifyCommand)
    .command(createAndSendCommand_1.createAndSendTxCommand)
    .command(getTransactionDataCommand_1.getTransactionDataCommand) // TODO: test getTransactionDataCommand and submitTxCommand
    .command(submitTxCommand_1.submitTxCommand)
    .help().argv;
