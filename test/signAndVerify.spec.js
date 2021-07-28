"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testVerifyCLI = void 0;
const child_process_1 = require("child_process");
const utils_1 = require("../src/methods/utils");
const sign_spec_1 = require("./sign.spec");
var assert = require("assert");
const testData = "0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301670d1902009f0000000200000091bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e3952717bcc5a548b2e478bb01f444ef5cedfca7e57040a32812e82958c0941fec7add";
async function testVerifyCLI(data, sig) {
    return new Promise((resolve) => {
        console.log('verify');
        let call = child_process_1.exec("yarn run cli verify " + data + " " + sig + " " + utils_1.ALITH);
        call.stdout?.on("data", function (chunk) {
            let message = chunk.toString();
            console.log('M:', message);
            if (message.substring(0, 11) === "VALIDITY : ") {
                resolve(message.substring(11, message.length - 1));
            }
        });
    });
}
exports.testVerifyCLI = testVerifyCLI;
describe("Signature Verification", function () {
    it("should verify the signature to be valid", async function () {
        this.timeout(15000);
        const signature = await sign_spec_1.testSignCLI(testData);
        console.log('signed');
        const verification = await testVerifyCLI(testData, signature);
        console.log("verification", verification);
        assert.equal(verification, "true");
    });
});
