## Context

The CLI runs via `ts-node` (`pnpm start`), which requires pinning `typescript` to a compatible version and a dedicated `typescript-compat.yml` workflow to verify they still work together. Node 24 natively strips TypeScript types. `package.json` declares `main: dist/index.js` but `dist/` is empty and gitignored — the "package" isn't real. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Run TypeScript directly with Node (no ts-node)
- Remove ts-node + typescript-pin workarounds and the compat workflow
- Make the package metadata truthful (module type, real build)

**Non-Goals:**
- Publishing to npm (not requested; only make the metadata truthful)
- Migrating to another runtime (Bun/Deno) or a full build-bundler setup
- Rewriting the CLI framework (stays commander)

## Decisions

### D1. Use Node native type-stripping as the runtime
Replace `ts-node src/index.ts` with `node src/index.ts`. Node 24 strips types natively. Rationale: removes the ts-node/typescript coupling that caused the pin + compat workflow. Alternative: `tsx` (still a dev dep; native avoids it entirely).

### D2. Adopt ESM explicitly
Add `"type": "module"` to `package.json` and fix directory imports (e.g. `src/cli` needs explicit `src/cli/index.js` or import maps). Rationale: Node's type-stripping is ESM-friendly; the code already uses `import`/`export`. The earlier smoke test confirmed directory-import resolution is the only blocker.

### D3. Drop the `typescript` pin constraint
Remove the ts-node-forced TypeScript pin. Keep TypeScript only as a build/dev tool (latest, via `tsc --noEmit` for typecheck). Delete `typescript-compat.yml`.

### D4. Make `main`/`dist` truthful
Add a `build` script (`tsc`) and wire `main` to the real output, or drop the misleading `main` field. Since publishing isn't in scope, prefer adding a working `build` + `typecheck` script and keeping `dist` gitignored, documenting that consumption uses `node src/index.ts`.

### D5. Minimal logger module
Introduce a tiny logger (info/warn/error) to replace scattered `console.*`. Keeps pipeline output debuggable; the `robust-scraper` change consumes it. (Shared dependency — land the logger here or in robust-scraper; keep consistent.)

## Risks / Trade-offs

- [Node type-stripping limits (no enums/namespaces at runtime)] → Codebase uses plain interfaces/types; verified no runtime-only TS features. `--experimental-transform-types` is the escape hatch if needed.
- [ESM conversion breakage] → Small module graph; explicit import fixes are low-risk. Typecheck + smoke run verify.
- [Removing the compat workflow reduces safety net] → `ci.yml` typecheck step covers TypeScript compatibility going forward.

## Migration Plan

1. Add `"type": "module"`, fix imports, switch start script to `node src/index.ts`.
2. Run lint + typecheck + a smoke `fetch links`/`volumes csv` to verify.
3. Remove ts-node dep, typescript pin, compat workflow.
4. Add `build`/`typecheck` scripts; align `main`.

## Open Questions

None.