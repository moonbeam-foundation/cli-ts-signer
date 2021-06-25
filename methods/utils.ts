
export function needParam(key: string, functionName: string, argv:{[key:string]:string}) {
    if (!argv[key]) {
      throw new Error(key + " parameter is required for " + functionName);
    }
  }
  export const moonbeamChains = [
    'moonbase',
    'moonbeam',
    'moonriver',
    'moonshadow'
  ];
  