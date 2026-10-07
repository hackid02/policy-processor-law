# Production publication record

The corrected frontend is live at **https://policyprocessor.vercel.app/** as of 2026-10-07.

## Source and hosting
- Repository: https://github.com/hackid02/policy-processor-law
- Reviewed change: https://github.com/hackid02/policy-processor-law/pull/1 (merged).
- Initial corrected implementation on main: `89f0d0659cea4d9d721ad8bc1ce2c3039398ff10`.
- Initial tested production deployment: `dpl_Dw1moyEkqaUAo3xcDohAeSQZ8B1g`.
- Initial deployment URL: https://policy-processor-hlhxj47fd-hackid3.vercel.app/
- Vercel project: `policy-processor`, root directory `web`.
- GitHub repository connected to Vercel for future deployments.
- `policyprocessor.vercel.app` added as a verified project domain, rather than leaving it only as a manual alias.

## Release checks
Both GitHub pull-request checks passed. Vercel's production build completed. All 18 browser regression checks passed against the new hosted deployment before switching the main URL, then passed against the public URL after promotion. RPC failure/race cases in that suite use intentional transport mocks; actual RPC verification is checked separately.

The old deployment was retained for rollback: `dpl_26ybPQiNqLYoJeubB89AZpoDC4sG`, https://policy-processor-jactfuon4-hackid3.vercel.app/.

This file records the initial corrected release. Subsequent successful main-branch builds may have different deployment IDs while retaining the same public URL. Inspect Vercel's deployment metadata for the current commit.

## Boundaries unchanged
No new vault or registry contract was deployed, no tokens were minted, no real funds moved, and no hackathon form was submitted by this publication. Courtroom balances remain simulated. The reference contracts remain unaudited. The older long-form video shows the prior build and must not be described as a capture of this corrected frontend without an update or disclosure.

## Restored-interface release

The follow-up release restores the original LAW book, card styling, theme controls and IGNIX / X Layer / TapeOut footer. It adds the approved guided Courtroom walkthrough, clear circuit boundaries and visible deployment evidence. The hero and footer explicitly acknowledge real OKB-funded manufacturing while identifying Courtroom balances and withdrawals as simulated. No reference-contract deployment or blockchain write is part of this release.

See SUBMISSION.md for the architecture trade-off, manufacturing evidence and remaining organizer/video/disclosure checks. Use the GitHub merge commit and Vercel deployment metadata to identify the release actually served at the public URL; the historical deployment IDs above describe the earlier corrected release.
