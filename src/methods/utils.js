"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = exports.isNetworkType = exports.testnetWs = exports.BALTATHAR = exports.ALITH = exports.authorizedChains = exports.relayChains = exports.moonbeamChains = void 0;
exports.moonbeamChains = ["moonbase", "moonbeam", "moonriver", "moonshadow"];
exports.relayChains = ["kusama", "polkadot", "westend", "rococo"];
exports.authorizedChains = exports.moonbeamChains.concat(exports.relayChains);
exports.ALITH = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
exports.BALTATHAR = "0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0";
exports.testnetWs = "wss://wss.testnet.moonbeam.network";
function isNetworkType(type) {
    if (["sr25519", "ethereum"].includes(type)) {
        return type;
    }
    else {
        return "ethereum";
    }
}
exports.isNetworkType = isNetworkType;
function exit() {
    process.exit();
}
exports.exit = exit;
