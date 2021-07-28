"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionData = exports.getTransactionData2 = void 0;
const api_1 = require("@polkadot/api");
const util_1 = require("@polkadot/util");
const moonbeam_types_bundle_1 = require("moonbeam-types-bundle");
const utils_1 = require("./utils");
const createAndSendTx_1 = require("./createAndSendTx");
async function getTransactionData2(tx, params, ws, address, network, sudo) {
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
            return new Promise((resolve) => {
                resolve({ id: 1, signature: "" });
            });
        },
    };
    await txExtrinsic.signAsync(address, { signer });
    utils_1.exit();
}
exports.getTransactionData2 = getTransactionData2;
async function getTransactionData(tx, params, ws, address, network, sudo) {
    return createAndSendTx_1.createAndSendTx(tx, params, ws, address, network, 
    // Here we don't want to send the signature, 
    // just see the payload so we return empty signature
    async (_) => {
        return "";
    }, sudo);
}
exports.getTransactionData = getTransactionData;
