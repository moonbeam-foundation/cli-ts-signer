export type SignArgs = {
  type: string;
  privateKey: string;
  message:string;
};
export type SignPromptArgs = {
  type: string;
  privateKey: string;
};
export type VerifyArgs = {
  message: string;
  signature: string;
  pubKey: string;
};
export type CreateAndSendArgs = {
  network: string;
  ws: string;
  address: string;
  tx: string;
  params: string;
  sudo?: boolean;
};
export type SendTxArgs = {
  ws: string;
  txData: string;
};
