import { Router } from 'express';
import { z } from 'zod';
import { verifySignature } from '../lib/verify';

export const router = Router();

const VerifyBody = z.object({
  message: z.string().min(1).max(1000),
  signature: z.string().min(1)
});

router.post('/', async (req, res) => {
  try {
    const { message, signature } = VerifyBody.parse(req.body);
    const { isValid, signer } = verifySignature(message, signature);

    return res.json({
      isValid,
      signer,
      originalMessage: message
    });
  } catch (err: any) {
    return res.status(400).json({
      isValid: false,
      error: err?.message || 'Invalid request'
    });
  }
});
