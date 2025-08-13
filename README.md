# Web3 Message Signer & Verifier

- Frontend: React + TS (Vite) + Dynamic.xyz (headless email OTP) + Embedded Wallet
- Backend: Node + Express + TS + ethers v6

## Requirements (from assignment)
- Headless Dynamic email login → show wallet address, sign custom message → send `{message, signature}` to backend → verify and respond. (Bonus: MFA)  
Source: DM-SaaS/legacy-fe-candidate-assignment.  

## Run locally

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev     # http://localhost:4000
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
```
Then, you should set VITE_DYNAMIC_ENV_ID from your Dynamic dashboard.

```bash
npm install
npm run dev     # http://127.0.0.1:3000
```

### 3) Tests

- backend

```bash
cd backend
npm test
```

- frontend

```bash
cd frontend
npm test
```


## Notes / Trade-offs
- Validation: Zod on the backend.
- CORS/Helmet configured; in-memory only.
- Signature verification: `ethers.verifyMessage` — throws on malformed signature; we return `isValid=false` if thrown.
- Local history stored in `localStorage`.
- Headless Dynamic OTP hooks used; if your SDK minor version differs, rename `connectWithEmail` / `verifyOneTimePassword` per docs.
- Extensible: you can add typed-data (EIP-712) signing later and MFA (Dynamic headless MFA guide).

## Deployment

- Frontend: Deploy on Vercel

    `https://web3-message-signer-verifier.vercel.app/`

- Backend: Deploy on Render

    `https://web3-message-signer-verifier.onrender.com`
