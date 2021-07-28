"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const util_crypto_1 = require("@polkadot/util-crypto");
const verifyFromPolkadotJs_1 = require("./verifyFromPolkadotJs");
async function verify(message, signature, pubKey, type) {
    let publicKey = verifyFromPolkadotJs_1.verifyFromPolkadotJs(message, signature);
    if (type === "ethereum") {
        publicKey = util_crypto_1.ethereumEncode(publicKey);
    }
    console.log("PUBKEY : " + pubKey);
    console.log("VALIDITY : " + (pubKey == publicKey).toString());
}
exports.verify = verify;
