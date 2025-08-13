import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Wallet } from 'ethers';
import { verifySignature } from '../lib/verify.js';

describe('verifySignature library', () => {
  it('recovers signer for a valid signature', async () => {
    const wallet = Wallet.createRandom();
    const message = 'hello world';
    const signature = await wallet.signMessage(message);

    const { isValid, signer } = verifySignature(message, signature);
    expect(isValid).toBe(true);
    expect(signer?.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  it('fails on malformed signature', () => {
    const { isValid, signer } = verifySignature('msg', '0xdeadbeef');
    expect(isValid).toBe(false);
    expect(signer).toBeNull();
  });
});

describe('POST /verify-signature', () => {
  it('returns isValid and signer', async () => {
    const wallet = Wallet.createRandom();
    const message = 'test-message';
    const signature = await wallet.signMessage(message);

    const res = await request(app)
      .post('/verify-signature')
      .send({ message, signature })
      .expect(200);

    expect(res.body.isValid).toBe(true);
    expect(res.body.signer.toLowerCase()).toBe(wallet.address.toLowerCase());
    expect(res.body.originalMessage).toBe(message);
  });

  it('400 on invalid body', async () => {
    const res = await request(app)
      .post('/verify-signature')
      .send({ message: '', signature: '' })
      .expect(400);

    expect(res.body.isValid).toBe(false);
  });
});
