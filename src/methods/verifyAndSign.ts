import { BN, bnToBn, hexToU8a, isNull, isUndefined, objectSpread, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { KeypairType } from "@polkadot/util-crypto/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import prompts from "prompts";
import fs from 'fs'
import { Metadata, TypeRegistry } from '@polkadot/types';
import { NetworkType, PayloadVerificationInfo, RegistryPersistantInfo } from "./types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { moonbeamChains } from "./utils";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { CodecHasher, OverrideModuleType, OverrideVersionedType, Registry, RegistryTypes } from "@polkadot/types/types";
import { ExtDef } from "@polkadot/types/extrinsic/signedExtensions/types";
import { sign } from "./sign";


function filterVersions (versions: OverrideVersionedType[] = [], specVersion: number): RegistryTypes {
  return versions
    .filter(({ minmax: [min, max] }) =>
      (isUndefined(min) || isNull(min) || specVersion >= min) &&
      (isUndefined(max) || isNull(max) || specVersion <= max)
    )
    .reduce((result: RegistryTypes, { types }): RegistryTypes =>
      objectSpread(result, types), {}
    );
}

export function getSpecTypes ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string, specVersion: bigint | BN | number): RegistryTypes {
  const _chainName = chainName.toString();
  const _specName = specName.toString();
  const _specVersion = bnToBn(specVersion).toNumber();

  // The order here is always, based on -
  //   - spec then chain
  //   - typesBundle takes higher precedence
  //   - types is the final catch-all override
  return objectSpread({},
    filterVersions({}[_specName], _specVersion),
    filterVersions({}[_chainName], _specVersion),
    filterVersions(knownTypes.typesBundle?.spec?.[_specName]?.types, _specVersion),
    filterVersions(knownTypes.typesBundle?.chain?.[_chainName]?.types, _specVersion),
    knownTypes.typesSpec?.[_specName],
    knownTypes.typesChain?.[_chainName],
    knownTypes.types
  );
}
export function getSpecHasher ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): CodecHasher | null {
  const _chainName = chainName.toString();
  const _specName = specName.toString();

  return knownTypes.hasher || knownTypes.typesBundle?.chain?.[_chainName]?.hasher || knownTypes.typesBundle?.spec?.[_specName]?.hasher || null;
}

/**
 * @description Based on the chain and runtimeVersion, get the applicable alias definitions (ready for registration)
 */
 export function getSpecAlias ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): Record<string, OverrideModuleType> {
  const _chainName = chainName.toString();
  const _specName = specName.toString();

  // as per versions, first spec, then chain then finally non-versioned
  return objectSpread({},
    knownTypes.typesBundle?.spec?.[_specName]?.alias,
    knownTypes.typesBundle?.chain?.[_chainName]?.alias,
    knownTypes.typesAlias
  );
}

/**
 * @description Based on the chain and runtimeVersion, get the applicable signed extensions (ready for registration)
 */
 export function getSpecExtensions ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): ExtDef {
  const _chainName = chainName.toString();
  const _specName = specName.toString();

  return objectSpread({},
    knownTypes.typesBundle?.spec?.[_specName]?.signedExtensions,
    knownTypes.typesBundle?.chain?.[_chainName]?.signedExtensions
  );
}


export async function verifyAndSign(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  filePath:string,
  wsUrl:string,
  message?: string
): Promise<string> {
  console.log('message (payload) ',message)
  // get the payload data from the file
	const rawdata = fs.readFileSync(filePath);
  const payloadVerifInfoFromFile:PayloadVerificationInfo = JSON.parse(rawdata as any);
  console.log("payloadVerifInfoFromFile",payloadVerifInfoFromFile)

  // let txExtrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>;
  // if (sudo) {
  //   txExtrinsic = await api.tx.sudo.sudo(api.tx[section][method](...splitParams));
  // } else {
  //   txExtrinsic = await api.tx[section][method](...splitParams);
  // }
  // const ws=

  let api: ApiPromise;
  if (type==="ethereum") {
    api = await ApiPromise.create({
      provider: new WsProvider(wsUrl),
      typesBundle: typesBundlePre900 as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(wsUrl),
    });
  }

  const initRegistry= async (registry: Registry,registryInfo:RegistryPersistantInfo): Promise<void> => {
    console.log("_initRegistry")
    // console.log("runtimeVersion.toJSON()",runtimeVersion.toJSON())
    // console.log("runtimeVersion.specName",runtimeVersion.specName)
    // console.log("runtimeVersion.specVersion",runtimeVersion.specVersion)
    // console.log("chain - chainName",chain.toString())
    // console.log("chainProps",chainProps)
    // console.log("chainMetadata",chainMetadata,chainMetadata.toJSON,chainMetadata.toRawType,chainMetadata.toHex())
    console.log('resolved')
    
    // console.log(runtimeVersion, chain, chainProps, chainMetadata)
    registry.setChainProperties(registryInfo.chainProps as any) //|| api.registry.getChainProperties());
    registry.setKnownTypes({typesBundle: typesBundlePre900});
    registry.register(getSpecTypes(registry, registryInfo.chainName as any, registryInfo.runtimeVersion.specName as any, registryInfo.runtimeVersion.specVersion));
    registry.setHasher(getSpecHasher(registry, registryInfo.chainName as any, registryInfo.runtimeVersion.specName as any));

    // for bundled types, pull through the aliases defined
    if (registry.knownTypes.typesBundle) {
      registry.knownTypes.typesAlias = getSpecAlias(registry, registryInfo.chainName as any, registryInfo.runtimeVersion.specName as any);
    }

    registry.setMetadata(
      // chainMetadata
      new Metadata(registry,registryInfo.metadataHex)
      , undefined, objectSpread<ExtDef>({}, getSpecExtensions(registry, registryInfo.chainName as any, registryInfo.runtimeVersion.specName as any), {}));
  }


  let hash=api.registry.createdAtHash
  let knownTypes=api.registry.knownTypes
  let metadata=api.registry.metadata
  console.log('hash',hash)
  console.log('knownTypes',knownTypes)
  // console.log('metadata',metadata.lookup)
  let jsonRegsitry=JSON.stringify(api.registry)
  // console.log("jsonRegsitry",jsonRegsitry)
  // NB: using a plain registry doesn't work and it is required to use the api (to be verified with latest api version)
 //  const registry = JSON.parse(jsonRegsitry)
  const registry = new TypeRegistry();
  await initRegistry(registry,payloadVerifInfoFromFile.registryInfo)
  // registry.setMetadata(new Metadata(registry,metadata.toHex()))
  console.log('knownTypes.types',knownTypes.types&&knownTypes.types)
  // knownTypes.types&& registry.register(knownTypes.types)
  // registry.setKnownTypes({})
  //registry.setMetadata(metadata as any)
  // registry.setLookup(metadata.lookup)
  console.log('with plain registry ')
  const hexFromSimpleRegistry=u8aToHex((registry
    .createType('ExtrinsicPayload', payloadVerifInfoFromFile.payload, { version: payloadVerifInfoFromFile.payload.version })).toU8a(true))
  const extrinsicPayload = api.registry
        .createType('ExtrinsicPayload', payloadVerifInfoFromFile.payload, { version: payloadVerifInfoFromFile.payload.version })

      const payloadHex=u8aToHex(extrinsicPayload.toU8a(true))
      console.log("Transaction data to be signed : ", payloadHex);
      console.log("hexFromSimpleRegistry",hexFromSimpleRegistry)
      console.log(payloadHex);
      console.log(hexFromSimpleRegistry);

      //no
      console.log('isSame',hexFromSimpleRegistry===payloadHex)

  console.log("payloadHex")
  console.log(payloadHex)
  console.log("message")
  console.log(message)
  if (hexFromSimpleRegistry!==message) {
    throw new Error("Payload is not matching payload in filepath");
  }

  // create the actual payload we will be using
  // const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
  // const payloadHex=u8aToHex(xp.toU8a(true))
  // console.log("Transaction data to be signed : ", extrinsicPayload);
  return sign(type,privKeyOrMnemonic,prompt,derivePath,message)
}
