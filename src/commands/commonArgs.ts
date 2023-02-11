import { NETWORK_YARGS_OPTIONS, PROXY_CHAIN_YARGS_OPTIONS } from "moonbeam-tools";

export const commonWrapperArgs = {
  sudo: {
    describe: "activates sudo mode",
    type: "boolean" as "boolean",
    default: false,
    demandOption: false,
  },
  ...PROXY_CHAIN_YARGS_OPTIONS,
};

export const commonArgs = {
  ...commonWrapperArgs,
  ...NETWORK_YARGS_OPTIONS,
};
