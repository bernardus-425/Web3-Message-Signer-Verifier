import { verifyMessage, getAddress } from 'ethers';

export function verifySignature(message: string, signature: string) {
  try {
    const recovered = verifyMessage(message, signature);
    const signer = getAddress(recovered);
    return { isValid: true, signer };
  } catch {
    return { isValid: false, signer: null as null };
  }
}
