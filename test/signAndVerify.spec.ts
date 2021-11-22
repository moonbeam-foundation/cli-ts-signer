import { exec } from "child_process";
import { ALITH } from "../src/methods/utils";
import { testSignCLIPrivateKey } from "./sign.spec";
var assert = require("assert");
const testData =
  "0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301670d1902009f0000000200000091bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e3952717bcc5a548b2e478bb01f444ef5cedfca7e57040a32812e82958c0941fec7add";

export async function testVerifyCLI(data: string, sig: string): Promise<string> {
  return new Promise((resolve) => {
    let call = exec("npm run cli verify " + data + " " + sig + " " + ALITH);
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      if (message.substring(0, 11) === "VALIDITY : ") {
        resolve(message.substring(11, message.length - 1));
      }
    });
  });
}

describe("Signature Verification", function () {
  it("should verify the signature to be valid", async function () {
    this.timeout(15000);
    const signature = await testSignCLIPrivateKey(testData);
    const verification = await testVerifyCLI(testData, signature);
    assert.equal(verification, "true");
  });
});
