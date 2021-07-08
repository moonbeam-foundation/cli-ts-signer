import { Keyring } from "@polkadot/keyring";
import { hexToU8a, numberToHex, u8aToHex, stringToU8a } from "@polkadot/util";
import type { KeyringPair } from "@polkadot/keyring/types";

// combine mnemonic with derivation path
const PHRASE =
  "seed sock milk update focus rotate barely fade car face mechanic mercy" + "/m/44'/60'/0'/0/0";
const PRIV_KEY_ONE = "0x070dc3117300011918e26b02176945cc15c3d548cf49fd8418d97f93af699e46";
const ETH_ADDRESS_ONE = "0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d";
const ETH_ADDRESS_TWO = "0x4119b2e6c3Cb618F4f0B93ac77f9BeeC7FF02887";

let keyring: Keyring;

keyring = new Keyring({ type: "ethereum" });

function expect(statement: boolean) {
  console.log(statement);
}

const MESSAGE = stringToU8a("just some test message");
const signer = keyring.createFromUri(PHRASE);
const verifier = keyring.addFromSeed(
  hexToU8a("0x7dce9bc8babb68fec1409be38c8e1a52650206a7ed90ff956ae8a6d15eeaaef4")
);
// const verifier = keyring.addFromJson(
//     JSON.parse('{"address":"KWCv1L3QX9LDPwY4VzvLmarEmXjVJidUzZcinvVnmxAJJCBou","encoded":"U8qFEaghhmNV2PgFhjqzmhyUy37Ok7abfFU2MNsBd0sAgAAAAQAAAAgAAAA3+NniKogzNphiMNueB1X0sGA07B6CaXWfpXPx45iSXoTTprwzU5mOoSqUWO0GKHROI72LN+uJ8Yfv6Ll6JOOV3VPKfoVoFmYm+zDrrMPa0gk5E5kUuSijxADcE6zUrliPVr0Ix/qaghu5SJ7RtWDQLBf4Hp86SJ8Gg6gTSSk=","encoding":{"content":["pkcs8","ethereum"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"meta":{}}')
//   );

const signature = signer.sign(MESSAGE);
const dummyPublic = verifier.publicKey.slice();

dummyPublic[dummyPublic.length - 1] = 0;
console.log("expecting true false false");
expect(verifier.verify(MESSAGE, signature, signer.publicKey));
expect(verifier.verify(MESSAGE, signature, dummyPublic));
expect(verifier.verify(new Uint8Array(), signature, signer.publicKey));
