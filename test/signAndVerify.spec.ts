import { exec } from "child_process";
import { ALITH } from "../src/methods/utils";
import { testSignCLIPrivateKey } from "./sign.spec";
var assert = require("assert");
const testData =
  "0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301670d1902009f0000000200000091bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e3952717bcc5a548b2e478bb01f444ef5cedfca7e57040a32812e82958c0941fec7add";
const veryLongString =
  "0x040001023c030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef6050003015ce895e4c5862bfd305c930edd78d99475c47e8d170000f8ec31818ef605000301f3d5b58c3936f67400d76c103b5ac2064283a4e2170000f8ec31818ef605000301f47f956f66433869e7091acdcf32e67aa1406310170000f8ec31818ef605000301e339ff168a7c793255c7c43001bc6c837a0cda69170000f8ec31818ef6050003018a482059a69270fe5338b1935aabfbe6cbbbde58170000f8ec31818ef6050003015fd2be87a9b5fd50f4b30de41d59a82337a41de7170000f8ec31818ef6050003010e5409fba28c823ef3ecbc9385f75a4b2ef9c712170000f8ec31818ef605000301e77f5dddc987822e4ca03f67566478684def9f28170000f8ec31818ef6050007000000e9030000020000006ef74dbac593617410aa0c7a39cd92fff716d9cdd3786c9f5a8cf977801510246ef74dbac593617410aa0c7a39cd92fff716d9cdd3786c9f5a8cf97780151024";

export async function testVerifyCLI(data: string, sig: string): Promise<string> {
  return new Promise((resolve) => {
    let call = exec(
      "npm run cli verify -- --type ethereum --message " +
        data +
        " --signature " +
        sig +
        " --pubKey " +
        ALITH
    );
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      if (message.search("VALIDITY") > -1) {
        resolve(message.substring(message.search("VALIDITY") + 11, message.length - 1));
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
  it("should verify the signature to be valid - veryLongString", async function () {
    this.timeout(15000);
    const signature = await testSignCLIPrivateKey(veryLongString);
    const verification = await testVerifyCLI(veryLongString, signature);
    assert.equal(verification, "true");
  });
});
