import { u8aToHex, u8aToU8a } from '@polkadot/util';
import elliptic from 'elliptic';
import { isReady, keccak256 } from '@polkadot/wasm-crypto';
import js from 'js-sha3';

const EC = elliptic.ec;

export const secp256k1 = new EC('secp256k1');

// const signature="0x936f2a0d37fbe0f049fb0be9b813a62ff627831126b3804d395c7d7b26d1f72d73637cfb1673774559c98ec26ad6f3b54c6e3b5f789438d8c39912e86718232d01"
// const message="just some test message"


export function keccakAsU8a (value: Buffer | Uint8Array | string, bitLength: 256 | 512 = 256, onlyJs = false): Uint8Array {
    const is256 = bitLength === 256;

    return isReady() && is256 && !onlyJs
      ? keccak256(u8aToU8a(value))
      : new Uint8Array(
        (is256 ? js.keccak256 : js.keccak512).update(u8aToU8a(value)).arrayBuffer()
      );
  }
  
export function secp256k1Hasher (data: Uint8Array | string): Uint8Array {
    // if (hashType === 'blake2') {
    //   return blake2AsU8a(data);
    // } else if (hashType === 'keccak') {
    //   return keccakAsU8a(data);
    // }
    return isReady() ?keccakAsU8a(data):keccakAsU8a(data);
    // throw new Error(`Unsupported secp256k1 hasher '${hashType as string}', expected one of ${HASH_TYPES.join(', ')}`);
  }

export function verify(message:string,signature:string):string{
  //console.log(message,signature)
    const u8a = u8aToU8a(signature);
  const publicKey = new Uint8Array(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      secp256k1
        .recoverPubKey(
          secp256k1Hasher(message),
          { r: u8a.slice(0, 32), s: u8a.slice(32, 64) },
          u8a[64]
        )
        .encodeCompressed()
    );
    return u8aToHex(publicKey)
    // console.log("publiKey",publicKey)
    // console.log("publiKey",u8aToHex(publicKey))
}
//console.log(verify("just some test message","0x936f2a0d37fbe0f049fb0be9b813a62ff627831126b3804d395c7d7b26d1f72d73637cfb1673774559c98ec26ad6f3b54c6e3b5f789438d8c39912e86718232d01"))