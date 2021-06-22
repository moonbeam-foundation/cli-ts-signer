
export function needParam(key: string, functionName: string, argv:{[key:string]:string}) {
    if (!argv[key]) {
      throw new Error(key + " parameter is required for " + functionName);
    }
  }