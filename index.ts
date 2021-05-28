import { Keyring } from "@polkadot/keyring";
import { hexToU8a, numberToHex, u8aToHex, stringToU8a } from "@polkadot/util";
import type { KeyringPair } from "@polkadot/keyring/types";
import { verify } from "./verify";

const { hideBin } = require("yargs/helpers");
const argv = require("yargs/yargs")(hideBin(process.argv)).option('signature', {
    string: true
}).option('privKey', {
    string: true
}).option('pubKey', {
    string: true
}).argv;
function needParam(key:string,functionName:string){
    if (!argv[key]) {
      throw new Error(key+" parameter is required for "+functionName);
    }
}

let keyring: Keyring;
switch (argv.type) {
  case "ethereum":
    keyring = new Keyring({ type: "ethereum" });
    break;
  default:
    console.log("type defaults to ethereum");
    keyring = new Keyring({ type: "ethereum" });
}

switch (argv._[0]) {
  case "sign":
    console.log("sign");
    needParam("message","sign")
    needParam("privKey","sign")
    const signer:KeyringPair = keyring.addFromSeed(hexToU8a((argv.privKey)));
    const signature:Uint8Array = signer.sign(stringToU8a(argv.message));
    console.log("SIGNATURE : " + u8aToHex(signature));
    console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
    break;
    case "verify":
      console.log("verify");
      // console.log('signature',argv.signature)
      needParam("message","verify")
      needParam("signature","verify")
      needParam("pubKey","verify")
    //   const verifier:KeyringPair = keyring.addFromJson(
    //     JSON.parse('{"address":"KWCv1L3QX9LDPwY4VzvLmarEmXjVJidUzZcinvVnmxAJJCBou","encoded":"U8qFEaghhmNV2PgFhjqzmhyUy37Ok7abfFU2MNsBd0sAgAAAAQAAAAgAAAA3+NniKogzNphiMNueB1X0sGA07B6CaXWfpXPx45iSXoTTprwzU5mOoSqUWO0GKHROI72LN+uJ8Yfv6Ll6JOOV3VPKfoVoFmYm+zDrrMPa0gk5E5kUuSijxADcE6zUrliPVr0Ix/qaghu5SJ7RtWDQLBf4Hp86SJ8Gg6gTSSk=","encoding":{"content":["pkcs8","ethereum"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"meta":{}}')
    //   );
      // const verifier = keyring.addFromSeed(hexToU8a("0x7dce9bc8babb68fec1409be38c8e1a52650206a7ed90ff956ae8a6d15eeaaef4"))
     let pubKey=verify((argv.message), ((argv.signature)))
      console.log("PUBKEY : " + pubKey);
      console.log(argv.pubKey,pubKey)
      console.log("VALIDITY : " + ((argv.pubKey)==pubKey).toString());
      break;
  default:
    console.log(`function not recognized`);
}
