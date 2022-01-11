import { exec } from "child_process";
var assert = require("assert");

// transaction data for a balance.tranfer from Alice to Balthathar of "1000000000000", on the moonbase testnet
const testData =
  "0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301670d1902009f0000000200000091bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e3952717bcc5a548b2e478bb01f444ef5cedfca7e57040a32812e82958c0941fec7add";
const expectedSignature =
  "0x71e5c0fe80f760192eb69681028fe085a0b0b4a73d78e33629be7967e5cd4ee57d12cf6bbaf461e48fc7f5409d6d805209620a362178e2b243302fb908707a7701";
const expectedSignatureBaltathar =
  "0xa85517f8b6c9d88810fff4e734db98adf5ed77547ac4adc3c61e4dbb539a2caa1cbc0cf4b8708bb81bc48a4748c040fcafd7ae9cd1882313df420cdf1eb15a1b01";

export async function testSign(command: string): Promise<`0x${string}`> {
  return new Promise((resolve) => {
    let call = exec(command);
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      console.log("l ", message);
      if (message.substring(0, 12) === "SIGNATURE : ") {
        resolve(message.substring(12, message.length - 1));
      }
    });
  });
}

export async function testSignCLIPrivateKey(data: string): Promise<`0x${string}`> {
  return testSign(
    "npm run cli sign -- --type ethereum --privateKey 0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133 --message " +
      data
  );
}

export async function testSignCLIMnemonic(data: string): Promise<`0x${string}`> {
  return testSign(
    `npm run cli sign -- --type ethereum --mnemonic "bottom drive obey lake curtain smoke basket hold race lonely fit walk" --message ` +
      data
  );
}

describe("Signature - privkey", function () {
  it.only("should correctly sign bytecode", async function () {
    this.timeout(200000);
    console.log("starr");
    const output = await testSignCLIPrivateKey(testData);
    console.log("starr");
    assert.equal(output, expectedSignature);
  });
});

describe("Signature - mnemonic", function () {
  it("should correctly sign bytecode with mnemonic", async function () {
    this.timeout(20000);
    const output = await testSignCLIMnemonic(testData);
    assert.equal(output, expectedSignature);
  });
  it("should correctly sign bytecode with mnemonic and derivation path (baltathar address)", async function () {
    this.timeout(20000);
    const output = await testSign(
      `npm run cli sign -- --type ethereum --mnemonic "bottom drive obey lake curtain smoke basket hold race lonely fit walk" --message ` +
        testData +
        ` --derivePath "/m/44'/60'/0'/0/1"`
    );
    assert.equal(output, expectedSignatureBaltathar);
  });
});
