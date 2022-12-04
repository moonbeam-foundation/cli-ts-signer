import { ApiPromise } from "@polkadot/api";
import prompts from "prompts";
import { retrieveApi } from "./utils";
import { NetworkOpt, ProxyOpt, TxWrapperOpt, Vote } from "./types";
import { createAndSendTx } from "./createAndSendTx";

export async function retrieveMotions(api: ApiPromise): Promise<
  {
    index: number;
    hash: string;
    text: string;
  }[]
> {
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
        // TODO: fix with new preimage
        const preimageData = (await api.query.democracy.preimages(motion.args[0])) as any;
        const proposal: any =
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

export async function voteCouncilPrompt(
  address: string,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt
) {
  const api = await retrieveApi(networkOpt.network, networkOpt.ws);

  // Retrieve list of motions
  const motions = await retrieveMotions(api);

  // Multiselect allows the user to chose multiple motions to vote for
  const motionSelection = await prompts({
    type: "multiselect",
    name: "index",
    message: "Pick motion",
    choices: motions.map((motion, i) => {
      return {
        title: `[Motion #${motion.index}] ${motion.text || `Not available - hash ${motion.hash}`}`,
        value: i,
      };
    }),
  });
  if (!motionSelection.index || motionSelection.index.length === 0) {
    throw new Error("There are no motions to vote for");
  }

  // For each selected motion, let the user chose a vote
  let votes: Vote[] = [];
  for (let j = 0; j < motionSelection.index.length; j++) {
    let i = motionSelection.index[j];
    const selectedMotion = motions[i];

    if (!selectedMotion) {
      console.log(`Selected motion doesn't exist`);
      return;
    }

    let vote: Vote = await prompts({
      type: "select",
      name: "yes",
      message: `Pick a vote for [Motion #${selectedMotion.index}] ${
        selectedMotion.text || `Not available - hash ${selectedMotion.hash}`
      }`,
      choices: [
        { title: "Yes", value: true },
        { title: "No", value: false },
      ],
    });
    console.log(
      `You are voting ${vote.yes} for [${selectedMotion.index} - ${selectedMotion.hash}]`
    );
    console.log(`  ${selectedMotion.text}`);
    votes.push(vote);
  }

  // If more than one motion, use batch utility
  const txOpt =
    votes.length === 1
      ? {
          address,
          tx: `councilCollective.vote`,
          params: [
            motions[motionSelection.index[0]].hash,
            motions[motionSelection.index[0]].index,
            votes[0].yes,
          ],
        }
      : {
          address,
          tx: `utility.batch`,
          params: [
            votes.map((vote: Vote, i: number) => {
              let selectedMotion = motions[motionSelection.index[i]];
              return api.tx.councilCollective.vote(
                selectedMotion.hash,
                selectedMotion.index,
                vote.yes
              );
            }),
          ],
        };
  return createAndSendTx(txOpt, txWrapperOpt, networkOpt, async (payload: string) => {
    const response = await prompts({
      type: "text",
      name: "signature",
      message: "Please enter signature for + " + payload + " +",
      validate: (value) => true, // TODO: add validation
    });
    return response["signature"].trim();
  });
}
