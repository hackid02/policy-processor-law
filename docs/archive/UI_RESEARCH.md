> HISTORICAL / SUPERSEDED. This file describes an earlier prototype and may contain incorrect claims. Do not use it as a submission or security specification. See README.md, VERIFY.md, SECURITY.md and SUBMISSION.md at the repository root.

# UI Research Dive — Making Policy Processor Unique & Better Than Seal/Stego/RuleChip
**Date:** Sep 25, 2026 | **Goal:** Best and unique UI out there for circuit-governed vaults

## Research Findings

### 1. Current Winners Audit (Why They Look Minimal)

**Remembrance Seal:** No custom site, just tapeout.net processor page + GitHub README. Brutalist, explorer-style, 0 design effort. Wins on narrative, not UI.

**Stego (stego-jade.vercel.app):** Single static file, live X Layer data, no backend. Black bg, white text, green/yellow/red verdicts, sliders for A/B, verdict map 65,536 inputs as heatmap, die view (each NAND as square lit when active), 25% tracker, Nerve game. Technical, dense, Bloomberg-terminal energy. No purple, no glassmorphism. Wins on depth + proof.

**RuleChip (lichao01111-dot.github.io/rulechip):** Single static file, no build, Snake game 8x8, 3 rule cartridges, signal path diagram, exhaustive 256 grid. White bg, black text, fun game + technical proof. Wins on fun + composability.

**Pattern:** All 3 are single static HTML files, no Next.js, no shadcn, no purple. They win because judges are engineers who trust proof over polish. But they all lack: modern 2026 dashboard polish, personality, unique visual metaphor.

### 2. Best DeFi Vault UI 2026 Research

**Vault Dashboard (Robinhood-inspired):** Clean minimal, white space, clear typography, sparklines, one-click trade, portfolio P&L, watchlists, allocation treemaps. Built Next.js 16 + shadcn/ui + Tailwind v4. Good for consumer trust.

**Fortress (Bloomberg-terminal):** Dark-first, dense analytic grids, yield curves, risk panels, high-contrast numerals, glassy panels, motion sparingly for state changes. For power users. This is what Stego leans toward.

**Tremor (Editor's Pick):** Component quality rivals premium, Tailwind foundation, easy to extend. Best for custom fintech dashboards.

**Fintech Dashboard Patterns That Work (2026):**
- Design pending state (money in-flight) — Wise transfer timeline reference
- Dark mode requirement in trading, option in banking
- 256px sidebar collapses to 64px icon rail
- Metric strip capped at 6 numbers, each with one comparison + one visual
- 12-column grid, 24px gutters, row heights minmax(200px, auto)
- 3 states for every component: loading (skeleton), empty, error
- Chart colors from token system, WCAG contrast verified
- Command palette (Cmd+K) for power users — Superhuman pattern
- Typography does hierarchy, not boxes/borders — Linear/Stripe plain on purpose

### 3. Circuit Visualization UI Research

**Syncfusion React Logic Circuit Designer:** Drag-drop AND/OR/NAND/NOR/XOR, orthogonal connectors with snapping, ports with constraints, simulation with live signal flow color-coded wires (yellow when 1), data binding JSON, export PNG/SVG/JSON, pan/zoom/multi-select/hotkeys. Professional.

**Logic Gate Simulators (TruthTableTools, CircuitLabs, LogicSimulation.com, MechSimulator):**
- Real-time signal propagation as you build, wires light up (green=HIGH, grey=LOW)
- Truth table auto-generates
- Gate inspector: click gate to see truth table + live state
- Save/load JSON, share via URL encoding circuit
- Timing diagram: live waveforms over 8s window, clock amber, inputs blue, outputs green
- Annotation tools: sketch freehand, shapes, text labels anchored to circuit
- Keyboard shortcuts: Space Run/Stop, Ctrl+Z Undo, R Rotate, D Duplicate

**InteractiveCode.space:** Matrix-themed terminal, drag-drop, animated green dots travel along wires showing signal propagation, live decompiler tooltip showing raw source code on hover, turns entire site into interactive coding tutorial.

**Key Takeaway:** Best circuit UIs have live signal propagation with animated dots + color-coded wires + truth table + timing diagram + ability to toggle inputs and see output instantly.

### 4. Winning Hackathon UI 2026 Research

**UNIHACK 2026 Best Design Winner Echo (UNSW/USYD):** Judge Luke Prior: "Echo stood out because of its design discipline. Everything about it feels deliberate — especially the 'breathing' UI elements that create a real sense of calm. It doesn't try to 'fix' the user; it uses a clean, focused aesthetic to act as a supportive tool in their arsenal."

**Second Place HABITMON:** Great personality through 8-bit character and sound design.

**Third Peersuade:** Innovative concept + pleasing execution.

**Pattern:** Winners have deliberate breathing UI, calm, supportive tool, personality (8-bit character, sound), not trying to fix user.

### 5. TapeOut Visual Metaphor Research

- Blockchain as silicon wafer, tokens as transistors (7-byte NAND)
- Canvas: drag transistor, pull wire, pointer assignment on-chain
- Tape Out: design goes to fab, etched into silicon, transistors burned, Circuit NFT born
- Lego-like composable: any finished circuit as black box dragged into canvas
- Behemoth: 2300 transistors, 2.22 Hz clock following BNB Chain block time, runs permanently, free to call, safe composability (no external calls, worst case wrong answer)

## Proposed Unique UI — "Law Foundry" — Better Than 3 Winners

### Concept: Split-Screen Foundry + Terminal + Tape

**Left 60%: Circuit Foundry (Interactive)**
- Isometric 3D view of processor (like Tiny Tapeout), 2.3M transistors as tiny squares, minted ones lit
- Drag-drop NAND gates (like Syncfusion), but gates look like physical transistors (etched silicon), not abstract symbols
- Wires: orthogonal routing with snapping, but when signal propagates, animated dots travel (like InteractiveCode.space Matrix green dots), wires glow yellow when 1, grey when 0
- Gate inspector: click NAND to see truth table + live state + gas cost to tape out
- LATCH as memory cell with pulse animation
- Timing diagram at bottom: live waveforms for inputs/outputs over 8s, amber for clock, blue for inputs, green for outputs
- Save/load as JSON, share via URL, export SVG

**Right 40%: Vault Terminal (Bloomberg + Robinhood)**
- Top: Metric strip (4 KPIs): TVL, Daily Outflow, Remaining Daily, Share Price — each with sparkline + comparison (like Vault Dashboard)
- Middle: Vault action (Deposit/Withdraw) with pending state designed (Wise timeline: "Confirm in wallet → Calling circuit → Receipt")
- Bottom: Verdict Map but as glowing heatmap (not flat grid) — 65,536 inputs as heatmap with glow where ALLOW green, THROTTLE yellow, HALT red, crosshair follows sliders, with breathing animation (Echo winner pattern)
- Die view: each NAND as square in die, lit when active for current input, with hover showing gate ID

**Center: The Tape (Physical Metaphor)**
- A physical tape that moves from Foundry (left) to Terminal (right) when you click "Tape Out"
- Animation: transistors on left get burned (fade out), tape moves, Circuit NFT appears on right with OKLink link
- Sound: subtle click when eval returns (like HABITMON 8-bit personality)

**Unique Elements No One Has:**
1. **Isometric Processor:** 2.3M tiny squares, not just number
2. **Animated Signal Dots:** Green dots traveling wires (InteractiveCode.space) + color-coded wires (Syncfusion)
3. **Breathing Verdict Map:** Glowing heatmap with breathing animation (Echo winner) + crosshair + 65k inputs
4. **Before/After Slider:** Left = config file in GitHub (editable), Right = Circuit NFT (permanent) — drag slider to see difference
5. **Command Palette:** Cmd+K to quickly eval, deposit, switch circuit — Superhuman pattern for power users
6. **Personality:** 8-bit character "Law Clerk" that reacts to ALLOW (happy) / DENY (shakes head) + subtle sound
7. **Tape Animation:** Physical tape moving from foundry to vault — unique TapeOut metaphor no one visualized
8. **One Accent Color:** Neutral base (black/white) + one accent amber #facc15 for interactive elements, semantic green/red only for status (Linear/Stripe plain on purpose)

### Design System (Unique, Not Purple Slop)

- **Base:** #0a0a0a bg, #111 card, #222 border, #e5e5e5 text, #a3a3a3 muted
- **Accent:** #facc15 amber for interactive (buttons, links, tape) — one accent only
- **Semantic:** #4ade80 green ALLOW, #facc15 yellow THROTTLE, #f87171 red HALT/DENY — reserved strictly for status
- **Typography:** Inter 600 headers, Inter 400 body, JetBrains Mono 13px proofs, tight number formatting
- **Layout:** 256px sidebar collapses to 64px icon rail, 4-6 KPI cards above fold, 12-column grid 24px gutters, row heights minmax(200px, auto), skeleton loading for every component
- **Motion:** Breathing for verdict map (2s ease-in-out), tape move 0.8s ease, signal dots 0.3s linear, no other motion — sparingly like Revolut
- **No:** Purple gradients, glassmorphism, generic AI blobs, 3D purple blobs

### Why This Wins vs Seal/Stego/RuleChip

- **vs Seal (no site):** We have full interactive foundry + terminal + tape animation + personality
- **vs Stego (dense technical):** We keep technical depth (verdict map, die view, exhaustive proof) but add unique visual metaphors (isometric processor, animated dots, tape animation, breathing) + consumer polish (Robinhood clean + Bloomberg density) + personality (8-bit clerk)
- **vs RuleChip (fun game):** We keep fun (game-like foundry + clerk personality) but for vaults (more aligned with Ignix prize) + add proof layer (OKLink receipts, bond/slash, 25% revenue)

### Implementation Plan (No OKB Needed for UI)

1. Build new page `/unique` with split-screen Foundry + Terminal + Tape
2. Use Canvas API for isometric processor + animated dots (no external lib)
3. Use CSS for breathing heatmap + tape animation
4. Mock data for now, switch to real eval() when processor deployed
5. Add Cmd+K command palette
6. Add 8-bit clerk SVG with ALLOW/DENY states

This will be the best and unique one out there — no one has visualized TapeOut as physical tape + isometric processor + animated signal dots + breathing verdict map + personality.
