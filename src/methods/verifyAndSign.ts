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
function getSpecTypes ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string, specVersion: bigint | BN | number): RegistryTypes {
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
function getSpecHasher ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): CodecHasher | null {
  const _chainName = chainName.toString();
  const _specName = specName.toString();

  return knownTypes.hasher || knownTypes.typesBundle?.chain?.[_chainName]?.hasher || knownTypes.typesBundle?.spec?.[_specName]?.hasher || null;
}

/**
 * @description Based on the chain and runtimeVersion, get the applicable alias definitions (ready for registration)
 */
function getSpecAlias ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): Record<string, OverrideModuleType> {
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
function getSpecExtensions ({ knownTypes }: Registry, chainName: Text | string, specName: Text | string): ExtDef {
  const _chainName = chainName.toString();
  const _specName = specName.toString();

  return objectSpread({},
    knownTypes.typesBundle?.spec?.[_specName]?.signedExtensions,
    knownTypes.typesBundle?.chain?.[_chainName]?.signedExtensions
  );
}

const initRegistry= async (registry: Registry,registryInfo:RegistryPersistantInfo): Promise<void> => {

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


export async function verifyAndSign(
  type: NetworkType,
  privKeyOrMnemonic: string,
  prompt: boolean,
  derivePath: string,
  filePath:string,
  message?: string
): Promise<string> {
  // get the payload data from the file
	const rawdata = fs.readFileSync(filePath);
  const payloadVerifInfoFromFile:PayloadVerificationInfo = JSON.parse(rawdata as any);

  // Recreate registry
  const registry = new TypeRegistry();
  await initRegistry(registry,payloadVerifInfoFromFile.registryInfo)
  
  // Check the payload against payload info
  const hexFromSimpleRegistry=u8aToHex((registry
    .createType('ExtrinsicPayload', payloadVerifInfoFromFile.payload, { version: payloadVerifInfoFromFile.payload.version })).toU8a(true))

  if (hexFromSimpleRegistry!==message) {
    throw new Error("Payload is not matching payload in filepath");
  }

  return sign(type,privKeyOrMnemonic,prompt,derivePath,message)
}
