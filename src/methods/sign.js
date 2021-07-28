"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
const util_1 = require("@polkadot/util");
const keyring_1 = require("@polkadot/keyring");
const util_crypto_1 = require("@polkadot/util-crypto");
const prompts_1 = __importDefault(require("prompts"));
// TODO display payload content
async function sign(type, privKey, prompt, message) {
    if (!["ethereum", "sr25519"].includes(type)) {
        throw new Error("Type is not supported");
    }
    await util_crypto_1.cryptoWaitReady();
    let keyring = new keyring_1.Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
    const signer = keyring.addFromSeed(util_1.hexToU8a(privKey));
    let msg = "";
    if (prompt) {
        const response = await prompts_1.default({
            type: "text",
            name: "message",
            message: "Please enter payload",
            validate: (value) => true, //value < 18 ? `Nightclub is 18+ only` : true
        });
        msg = response.message;
    }
    else if (message) {
        msg = message;
    }
    else {
        throw new Error("sign must either provide message or use prompt");
    }
    // console.log('response',response, response['message'].length) //226 for relay, 216 pr moonbeam
    const signature = type === "ethereum"
        ? signer.sign(util_1.hexToU8a(msg))
        : signer.sign(util_1.hexToU8a(msg), { withType: true });
    console.log("SIGNATURE : " + util_1.u8aToHex(signature));
    console.log("FOR PUBKEY : " + util_1.u8aToHex(signer.publicKey));
    return util_1.u8aToHex(signature);
}
exports.sign = sign;
