import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import prompts from "prompts";
import { moonbeamChains } from "./utils";
import { NetworkArgs } from "./types";
import { createAndSendTx } from "./createAndSendTx";

export async function retrieveMotions(networkArgs: NetworkArgs): Promise<
  {
    index: number;
    hash: string;
    text: string;
  }[]
> {
  const { ws, network } = networkArgs;

  // Instantiate Api
  let api: ApiPromise;
  if (moonbeamChains.includes(network)) {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundlePre900 as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
    });
  }

  // Fetch list of proposal hashes, descriptions and votes
  const hashes = (await api.query["councilCollective"].proposals()) as any;
  const motionList = (await api.query["councilCollective"].proposalOf.multi(hashes)) as any;
  const votes = (await api.query["councilCollective"].voting.multi(hashes)) as any;

  return await Promise.all(
    motionList.map(async (motionData: any, index: any) => {
      const motion = motionData.unwrap();
      const vote = votes[index].unwrap();
      const hash = hashes.toArray()[index].toHex();

      console.log(`[${vote.index}] ${motion.section}.${motion.method}`);
      const data = {
        index: Number(vote.index),
        hash,
        text: "",
      };
      if (
        motion.method == "externalProposeMajority" ||
        motion.method == "externalProposeDefault" ||
        motion.method == "externalPropose"
      ) {
        const preimageData = (await api.query.democracy.preimages(motion.args[0])) as any;
        const proposal =
          preimageData.toHuman() && preimageData.unwrap().isAvailable
            ? api.registry.createType(
                "Proposal",
                preimageData.unwrap().asAvailable.data.toU8a(true)
              )
            : null;

        if (proposal) {
          data.text = `[${vote.index}] ${motion.method} - ${proposal.toHuman().section}.${
            proposal.toHuman().method
          }: ${Object.keys((proposal.toHuman() as any).args)
            .map((argKey: any) => {
              const text = `${argKey}:${(proposal.toHuman() as any).args[argKey]}`;
              return `${
                text.length > 100
                  ? `${text.substring(0, 7)}..${text.substring(text.length - 4)}`
                  : text
              }`;
            })
            .join(`, `)}`;
        }
      } else {
        data.text = `[${vote.index}] ${motion.section}.${motion.method}`;
      }
      return data;
    })
  );
}

export async function voteCouncilPrompt(address: string, networkArgs: NetworkArgs) {
  const motions = await retrieveMotions(networkArgs);

  const motionIndex = await prompts({
    type: "select",
    name: "index",
    message: "Pick motion",
    choices: motions.map((motion, i) => {
      return {
        title: `[Motion #${motion.index}] ${motion.text || `Not available - hash ${motion.hash}`}`,
        value: i,
      };
    }),
  });
  const selectedMotion = motions[motionIndex.index];

  if (!selectedMotion) {
    console.log(`Selected motion doesn't exist`);
    return;
  }

  const vote = await prompts({
    type: "select",
    name: "yes",
    message: `Pick a vote for ${selectedMotion.text}`,
    choices: [
      { title: "Yes", value: true },
      { title: "No", value: false },
    ],
  });
  console.log(`You are voting ${vote.yes} for [${selectedMotion.index} - ${selectedMotion.hash}]`);
  console.log(`  ${selectedMotion.text}`);

  return createAndSendTx(
    {
      address,
      tx: `councilCollective.vote`,
      params: [selectedMotion.hash, selectedMotion.index, vote.yes],
    },
    networkArgs,
    async (payload: string) => {
      const response = await prompts({
        type: "text",
        name: "signature",
        message: "Please enter signature for + " + payload + " +",
        validate: (value) => true, // TODO: add validation
      });
      return response["signature"].trim();
    }
  );
}
