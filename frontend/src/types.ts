export type VerifyResponse = {
  isValid: boolean;
  signer: string | null;
  originalMessage?: string;
  error?: string;
};

export type HistoryItem = {
  message: string;
  signature: string;
  result: VerifyResponse;
  at: string; // ISO
};
