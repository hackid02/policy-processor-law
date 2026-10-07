# Publishing the corrected LAW build

## What this patch does NOT do

It does not push to GitHub, change your Vercel deployment, deploy or upgrade any contract, mint tokens, move funds, register your hackathon entry, or assert an independent audit. The public URL remains the old build until you publish this patch.

The existing mainnet processor does not need to be redeployed to run the corrected playground or Courtroom simulation. Do not spend the remaining wallet balance just to apply a frontend fix.

## 1. Review the changes

Changes are prepared on `fix/verified-policy-demo`. Review `git diff` or the supplied patch, particularly the removed prototype contract APIs. `VaultLaw.withdraw(uint256)` and `PolicyRegistry.registerPolicy(uint256,string)` are intentionally incompatible with the old unsafe APIs.

If you use the source ZIP, extract it into a clean branch of your repository. Do not copy dependency directories or cached builds. Use the supplied lockfiles.

## 2. Test locally

```sh
npm ci
npm test
npm run verify:mainnet
npm --prefix web ci
npm --prefix web run build
npm --prefix web run start
# another terminal:
npx playwright install --with-deps chromium
npm run test:browser
```

The mainnet command is read-only. Contract tests use Anvil, not your wallet. The UI cannot send transactions.

## 3. Publish the frontend

Push the reviewed branch through your usual authenticated Git workflow. Merge only after CI/review. Never paste private keys or account tokens into chat.

For Vercel:
- Project root directory: `web`.
- Framework: Next.js.
- Node: 20.9+ (Node 22 LTS is also suitable).
- Install/build: `npm ci` / `npm run build`.
- Output directory: framework default.
- Deploy a preview first; verify the exact commit.

The app uses the public X Layer RPC for explicit read-only checks. Test that browser CORS access works from your real Vercel origin. If an RPC is unavailable, the UI must say "Not verified" rather than falling back to a live-looking result.

The patch updates Next.js and React and keeps TypeScript build failures enabled. Legacy pages redirect to the corrected UI; old standalone demo HTML files are removed.

## 4. Production smoke test

- Fresh Courtroom: balance 1.00, spent 0.00, limit 0.10.
- First 0.90 request: DENY; balance unchanged.
- Two 0.05 requests: ALLOW, ALLOW; spent 0.10.
- Next 0.01 request: DENY.
- Deposit more: daily allowance remains zero.
- Reset demo: balance and outflow return to initial values.
- SpendLimit `11`: local DENY; RPC verification is a separate operation.
- Quorum `101`: output 1 is PASS, not DENY.
- RPC outage: explicit error, no false LIVE badge.
- Check the mobile layout, source links, and `/verification.json` snapshot.

The served verification snapshot is recorded evidence. If you rerun the verifier and want a fresh web snapshot, review the generated report and update the bundled snapshot before rebuilding. Do not manually change NOT_VERIFIED into a pass.

## 5. Contracts

Do not broadcast new reference-contract deployments as part of the web update. The code has regression tests, not an independent audit. A future deployment requires separate review and explicit approval, constructor parameters, governance decisions, and a safety plan. See SECURITY.md.

Old deployment/Foundry examples with incorrect factory/processor addresses, fake 65k proof claims, or duplicate unsafe registry definitions have been removed. Use the canonical Node test suite and read-only verifier.

## 6. Submission and video

Use SUBMISSION.md, ECONOMICS.md and VERIFY.md. Submit through the organizer's actual flow and retain confirmation. A repository Markdown file is not a completed hackathon entry.

The earlier long-form video shows the previous prototype, including the now-fixed threshold mismatch and old registry claims. Do not present it as a recording of this revision. The handoff includes a short silent corrected-flow recording; replace the affected sections or disclose the old build explicitly before attaching the long-form film.

Published deadline at review time: October 9, 2026, 04:00 UTC / 05:00 Lagos. Recheck https://ignix.bot/x_campaign#hackathon-rules for organizer updates.
