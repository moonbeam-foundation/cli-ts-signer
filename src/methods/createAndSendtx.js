"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendTxPrompt = exports.createAndSendTx = void 0;
const api_1 = require("@polkadot/api");
const util_1 = require("@polkadot/util");
const moonbeam_types_bundle_1 = require("moonbeam-types-bundle");
const prompts_1 = __importDefault(require("prompts"));
const utils_1 = require("./utils");
async function createAndSendTx(tx, params, ws, address, network, signatureFunction, sudo) {
    const [section, method] = tx.split(".");
    const splitParams = params.split(",");
    let api;
    if (utils_1.moonbeamChains.includes(network)) {
        api = await api_1.ApiPromise.create({
            provider: new api_1.WsProvider(ws),
            typesBundle: moonbeam_types_bundle_1.typesBundle,
        });
    }
    else {
        api = await api_1.ApiPromise.create({
            provider: new api_1.WsProvider(ws),
        });
    }
    let txExtrinsic;
    if (sudo) {
        txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams));
    }
    else {
        txExtrinsic = await api.tx[section][method](...splitParams);
    }
    const signer = {
        signPayload: (payload) => {
            console.log("(sign)", payload);
            // create the actual payload we will be using
            const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
            console.log("Transaction data to be signed : ", util_1.u8aToHex(xp.toU8a(true)));
            return new Promise(async (resolve) => {
                const signature = await signatureFunction(util_1.u8aToHex(xp.toU8a(true)));
                resolve({ id: 1, signature });
            });
        },
    };
    await txExtrinsic.signAndSend(address, { signer });
    // exit();
}
exports.createAndSendTx = createAndSendTx;
async function createAndSendTxPrompt(tx, params, ws, address, network, sudo) {
    return createAndSendTx(tx, params, ws, address, network, async (payload) => {
        const response = await prompts_1.default({
            type: "text",
            name: "signature",
            message: "Please enter signature for + " + payload + " +",
            validate: (value) => true, //value < 18 ? `Nightclub is 18+ only` : true
        });
        return response["signature"].trim();
    }, sudo);
}
exports.createAndSendTxPrompt = createAndSendTxPrompt;
