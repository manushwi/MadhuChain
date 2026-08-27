# HoneyChain — Repo Structure Guide

## Recommendation: One Monorepo, using Turborepo for the JS/TS pieces

Given how tightly coupled your pieces are — the backend, the three frontends, and even the chaincode all share the same data model (Batch, Hive, QualityTest, JarSerial, etc.) — a monorepo is the better fit over separate repos, **even with the two-machine split**. Here's why, then the structure.

---

## Why monorepo beats separate repos here

| | Monorepo | Separate repos |
|---|---|---|
| Shared types (Batch, QualityTest, API request/response shapes) | Define once in a shared package, import everywhere — backend and frontend can never drift out of sync | Must duplicate type definitions in each repo, or publish/version a private npm package just to share them — real overhead for a small team |
| PRD/docs | Live in the same repo, versioned alongside the code they describe | End up duplicated across repos or living in a separate "docs" repo nobody keeps updated |
| Cross-cutting changes (e.g. adding a field to Batch) | One PR touches chaincode + backend + frontend together, reviewed as one coherent change | Three separate PRs across three repos, easy for them to get out of sync in timing |
| Claude Code sessions | Can see the whole system's context if needed, even when working in one folder | Each session only sees its own repo — loses cross-component context unless you paste it in manually (which you're already doing) |
| Two-machine split | Still works fine — see below | Also works fine, no real advantage here |

**The two-machine setup does not require separate repos.** Git doesn't care that you have two computers — clone the *same* repo on both PC A and PC B, and each machine simply works inside its own subfolder (`apps/` on PC A, `chain/` + `services/` on PC B). You push/pull through GitHub as normal; nobody needs to build the parts that live on the other machine locally.

---

## Recommended Structure

```
honeychain/
├── apps/                          # PC A works here
│   ├── beekeeper-app/
│   ├── factory-app/
│   └── consumer-web/
│
├── services/                      # PC B works here
│   └── backend-api/
│
├── chain/                         # PC B works here
│   ├── chaincode/
│   │   └── honeychain-cc/         # TypeScript chaincode — can be a workspace member
│   └── network/                   # Fabric docker-compose, crypto config, channel config
│                                   # (not JS — not part of the workspace/Turborepo graph)
│
├── firmware/                      # PC B works here (or a third dev machine if you have one)
│   ├── hive-sensor-esp32/         # C/C++ for the slave nodes
│   └── gateway-node/              # Python/Node for the Raspberry Pi master node
│
├── packages/
│   ├── shared-types/              # TypeScript interfaces: Batch, Hive, QualityTest,
│   │                               # ProcessingAction, JarSerial, API request/response types
│   │                               # — imported by backend, all 3 apps, and chaincode
│   └── ui/                        # (optional) shared React components if the 3 apps
│                                   # want a consistent design system later
│
├── docs/
│   ├── honeychain-prd.md
│   ├── honeychain-system-plan.md
│   ├── honeychain-apps-spec.md
│   ├── honeychain-processing-chain.md
│   ├── honeychain-multisource-sourcing.md
│   └── honeychain-build-guide.md
│
├── turbo.json
├── package.json                   # defines workspaces
└── pnpm-workspace.yaml            # (if using pnpm — recommended)
```

---

## What Turborepo Actually Buys You Here

Turborepo isn't required — plain npm/pnpm workspaces would technically work — but it adds two things worth having as the project grows:

1. **Task caching** — `turbo run build` only rebuilds packages that actually changed, instead of rebuilding all three frontends + backend + chaincode every time. Saves real time once the project isn't tiny anymore.
2. **Task orchestration** — a single `turbo run dev` can spin up the backend and whichever frontend(s) you're working on together, respecting dependency order (e.g. `shared-types` builds before anything that imports it).

**Package manager:** use **pnpm** — it's the standard pairing with Turborepo, handles workspace dependencies efficiently, and avoids the node_modules duplication you'd get with npm across many packages.

Note: `chain/network/` (the Fabric Docker/crypto config) and `firmware/` are **not** part of the Turborepo/JS workspace graph — they're not JS packages, they just live in the repo for version control and documentation purposes. Turborepo only orchestrates the `apps/`, `services/`, `packages/`, and optionally `chain/chaincode/` (if it's TypeScript).

---

## Practical Git Workflow Across Two Machines

1. Create the repo on GitHub, clone it on **both** PC A and PC B.
2. On PC A: `cd apps/beekeeper-app && pnpm install && pnpm dev` — only ever touches the `apps/` folder day-to-day.
3. On PC B: `cd services/backend-api && pnpm install && pnpm dev`, plus the separate `chain/network` Docker/Fabric commands — only ever touches `services/`, `chain/`, and `firmware/`.
4. Both machines `git pull` before starting work and `git push` when done, same as any normal team workflow — the physical machine split just becomes "which folder I usually cd into," nothing more.
5. Whenever the shared data model changes (e.g. adding a field to `QualityTest`), update `packages/shared-types` first, commit, push, then pull on the other machine before continuing — this is the one place where the two machines genuinely need to stay in sync, since both sides import from it.

---

## When Separate Repos Would Actually Make Sense

Worth naming so you know the tradeoff isn't one-sided — split into separate repos later if/when:
- You bring on separate teams that should have independent access control (e.g. an outside contractor building only the consumer website shouldn't see your chaincode).
- CI/CD pipelines get complex enough that per-repo deploy pipelines are genuinely simpler than a monorepo's filtered pipelines.
- The firmware code (ESP32/embedded) starts needing a completely different toolchain/review process than the rest.

None of these apply at your current stage — start monorepo, split later if a concrete reason shows up.
