import tcpPortUsed from "tcp-port-used";
import { spawn, ChildProcess } from "child_process";
import { ApiPromise } from "@polkadot/api";
import { BlockHash } from "@polkadot/types/interfaces";

import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";

export const BINARY_PATH = process.env.BINARY_PATH || `../moonbeam/target/release/moonbeam`;
export const MOONBEAM_LOG = process.env.MOONBEAM_LOG || "info";
export const SPAWNING_TIME = 20000;
export const DISPLAY_LOG = process.env.MOONBEAM_LOG || false;

const debug = require("debug")("test:dev-node");

// test parachain from docker
const paraName = "moonbase-0.11.2";
const paraDocker = "purestake/moonbeam:v0.11.2";

export async function findAvailablePorts() {
  const availablePorts = await Promise.all(
    [null, null, null].map(async (_, index) => {
      let selectedPort = 0;
      let port = 1024 + index * 20000 + (process.pid % 20000);
      let endingPort = 65535;
      while (!selectedPort && port < endingPort) {
        const inUse = await tcpPortUsed.check(port, "127.0.0.1");
        if (!inUse) {
          selectedPort = port;
        }
        port++;
      }
      if (!selectedPort) {
        throw new Error(`No available port`);
      }
      return selectedPort;
    })
  );

  return {
    p2pPort: availablePorts[0],
    rpcPort: availablePorts[1],
    wsPort: availablePorts[2],
  };
}

// Stores if the node has already started.
// It is used when a test file contains multiple describeDevMoonbeam. Those are
// executed within the same PID and so would generate a race condition if started
// at the same time.
let nodeStarted = false;

// This will start a moonbeam dev node, only 1 at a time (check every 100ms).
// This will prevent race condition on the findAvailablePorts which uses the PID of the process
export async function startMoonbeamDevNode(withWasm?: boolean): Promise<{
  p2pPort: number;
  rpcPort: number;
  wsPort: number;
  runningNode: ChildProcess;
}> {
  while (nodeStarted) {
    // Wait 100ms to see if the node is free
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
  nodeStarted = true;
  const { p2pPort, rpcPort, wsPort } = await findAvailablePorts();

  let cmd: string;
  if (process.env.LOCAL_BUILD) {
    cmd = BINARY_PATH;
  } else {
    // if no specified local chain
    // build parachain binary from docker
    const parachainBinary = `build/${paraName}/moonbeam`;
    const parachainPath = path.join(__dirname, `build/${paraName}/moonbeam`);
    if (!fs.existsSync(parachainPath)) {
      console.log(`     Missing ${parachainBinary} locally, downloading it...`);
      child_process.execSync(`mkdir -p ${path.dirname(parachainPath)} && \
            docker create --name moonbeam-tmp ${paraDocker} && \
            docker cp moonbeam-tmp:/moonbeam/moonbeam ${parachainPath} && \
            docker rm moonbeam-tmp`);
      console.log(`${parachainBinary} downloaded !`);
    }
    cmd = parachainPath;
  }

  const args = [
    withWasm ? `--execution=Wasm` : `--execution=Native`, // Faster execution using native
    `--no-telemetry`,
    `--no-prometheus`,
    `--dev`,
    `--ethapi=txpool`,
    `--sealing=manual`,
    `-l${MOONBEAM_LOG}`,
    `--port=${p2pPort}`,
    `--rpc-port=${rpcPort}`,
    `--ws-port=${wsPort}`,
    `--tmp`,
  ];
  debug(`Starting dev node: --port=${p2pPort} --rpc-port=${rpcPort} --ws-port=${wsPort}`);

  const onProcessExit = function () {
    runningNode && runningNode.kill();
  };
  const onProcessInterrupt = function () {
    process.exit(2);
  };

  // let runningNode: ChildProcess = null;
  process.once("exit", onProcessExit);
  process.once("SIGINT", onProcessInterrupt);
  let runningNode: ChildProcess = spawn(cmd, args);

  runningNode.once("exit", () => {
    process.removeListener("exit", onProcessExit);
    process.removeListener("SIGINT", onProcessInterrupt);
    nodeStarted = false;
    debug(`Exiting dev node: --port=${p2pPort} --rpc-port=${rpcPort} --ws-port=${wsPort}`);
  });

  runningNode.on("error", (err) => {
    if ((err as any).errno == "ENOENT") {
      console.error(
        `\x1b[31mMissing Moonbeam binary ` +
          `(${BINARY_PATH}).\nPlease compile the Moonbeam project\x1b[0m`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  const binaryLogs: any[] = [];
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      console.error(`\x1b[31m Failed to start Moonbeam Test Node.\x1b[0m`);
      console.error(`Command: ${cmd} ${args.join(" ")}`);
      console.error(`Logs:`);
      console.error(binaryLogs.map((chunk) => chunk.toString()).join("\n"));
      throw new Error("Failed to launch node");
    }, SPAWNING_TIME - 2000);

    const onData = async (chunk: any) => {
      if (DISPLAY_LOG) {
        console.log(chunk.toString());
      }
      binaryLogs.push(chunk);
      if (chunk.toString().match(/Development Service Ready/)) {
        clearTimeout(timer);
        if (!DISPLAY_LOG) {
          runningNode.stderr?.off("data", onData);
          runningNode.stdout?.off("data", onData);
        }
        resolve();
      }
    };
    runningNode.stderr?.on("data", onData);
    runningNode.stdout?.on("data", onData);
  });

  return { p2pPort, rpcPort, wsPort, runningNode };
}

export async function createAndFinalizeBlock(
  api: ApiPromise,
  parentHash?: BlockHash,
  finalize: boolean = true
): Promise<{
  duration: number;
  hash: BlockHash;
}> {
  const startTime: number = Date.now();
  let hash = undefined;
  try {
    if (parentHash == undefined) {
      hash = (await api.rpc.engine.createBlock(true, finalize)).toJSON()["hash"];
    } else {
      hash = (await api.rpc.engine.createBlock(true, finalize, parentHash)).toJSON()["hash"];
    }
  } catch (e) {
    console.log("ERROR DURING BLOCK FINALIZATION", e);
  }

  return {
    duration: Date.now() - startTime,
    //@ts-ignore
    hash,
  };
}
