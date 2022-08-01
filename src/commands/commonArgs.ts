
import { authorizedChains } from "../methods/utils";
import { TxWrapperArgs } from "./types";

export const commonWrapperArgs: {[Property in keyof TxWrapperArgs]: any} = {
    sudo: {
        describe: "activates sudo mode",
        type: "boolean" as "boolean",
        default: false,
        demandOption: false,
    },
    "proxied-account": {
        describe: "address of the proxied account",
        type: "string" as "string",
    },
    "proxy-type": {
        describe: "Type of proxy",
        type: "string" as "string",
    },
};

export const commonNetworkArgs = {
    network: {
        describe: "the network on which you want to send the tx",
        type: "string" as "string",
        choices: authorizedChains,
        demandOption: true,
    },
    ws: {
        describe: "websocket address of the endpoint on which to connect",
        type: "string" as "string",
        demandOption: true,
    }
}

export const commonArgs = {
    ...commonWrapperArgs,
    ...commonNetworkArgs
}