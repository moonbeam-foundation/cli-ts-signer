"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFromPolkadotJs = exports.secp256k1Hasher = exports.keccakAsU8a = exports.secp256k1 = void 0;
const util_1 = require("@polkadot/util");
const elliptic_1 = __importDefault(require("elliptic"));
const wasm_crypto_1 = require("@polkadot/wasm-crypto");
const js_sha3_1 = __importDefault(require("js-sha3"));
const EC = elliptic_1.default.ec;
exports.secp256k1 = new EC("secp256k1");
function keccakAsU8a(value, bitLength = 256, onlyJs = false) {
    const is256 = bitLength === 256;
    return wasm_crypto_1.isReady() && is256 && !onlyJs
        ? wasm_crypto_1.keccak256(util_1.u8aToU8a(value))
        : new Uint8Array((is256 ? js_sha3_1.default.keccak256 : js_sha3_1.default.keccak512).update(util_1.u8aToU8a(value)).arrayBuffer());
}
exports.keccakAsU8a = keccakAsU8a;
function secp256k1Hasher(data) {
    return wasm_crypto_1.isReady() ? keccakAsU8a(data) : keccakAsU8a(data); // TODO: this should be refactored
}
exports.secp256k1Hasher = secp256k1Hasher;
function verifyFromPolkadotJs(message, signature) {
    const u8a = util_1.u8aToU8a(signature);
    const publicKey = new Uint8Array(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    exports.secp256k1
        .recoverPubKey(secp256k1Hasher(message), { r: u8a.slice(0, 32), s: u8a.slice(32, 64) }, u8a[64])
        .encodeCompressed());
    return util_1.u8aToHex(publicKey);
}
exports.verifyFromPolkadotJs = verifyFromPolkadotJs;
