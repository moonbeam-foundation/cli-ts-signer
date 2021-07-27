import { exec } from "child_process";
var assert = require("assert");
var debug = require('debug')('child_proc')
const testData =
  "0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301670d1902009f0000000200000091bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e3952717bcc5a548b2e478bb01f444ef5cedfca7e57040a32812e82958c0941fec7add";
const expectedSignature =
  "0x71e5c0fe80f760192eb69681028fe085a0b0b4a73d78e33629be7967e5cd4ee57d12cf6bbaf461e48fc7f5409d6d805209620a362178e2b243302fb908707a7701";

export async function testSignCLI(data: string): Promise<string> {
  return new Promise((resolve) => {
    let call = exec(
      "yarn run cli sign ethereum 0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133 " +
        data
    );
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      console.log('message',"+"+message+"+")
      console.log(message)
      debug(message)
      if (message.substring(0, 12) === "SIGNATURE : ") {
        resolve(message.substring(12, message.length - 1));
      }
    });
  });
}

describe("Signature", function () {
  it("should correctly sign bytecode", async function () {
    this.timeout(5000);
    const output = await testSignCLI(testData);
    assert.equal(output, expectedSignature);
  });
});
