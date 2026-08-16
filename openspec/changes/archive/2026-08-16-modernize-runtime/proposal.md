## Why

The project runs on `ts-node`, which is increasingly incompatible with current TypeScript versions. This forced a TypeScript downgrade (`5274025`) and a dedicated `typescript-compat.yml` workflow that exists *only* to verify ts-node still works. Node 24 supports native TypeScript type-stripping, making the entire ts-node dependency (and its workarounds) unnecessary.

## What Changes

- Replace `ts-node` execution with Node's native TypeScript type-stripping: `pnpm start` becomes `node src/index.ts`.
- Remove the `ts-node` dependency and the pinned `typescript` version constraint.
- Delete the `typescript-compat.yml` workflow.
- Add `"type": "module"` to `package.json` and fix module resolution (directory imports) so the code runs natively as ESM.
- Add a real `build` script (`tsc`) and make `main: dist/index.js` truthful, or remove the misleading `main` field if the package is not actually published.
- Replace direct `console.*` calls with a small logger abstraction where it aids pipeline debugging.

## Capabilities

This is a pure tooling/runtime refactor with no behavior change to the CLI commands or data pipeline. No spec-level behavior changes.

## Impact

- `package.json`, `tsconfig.json`, `.github/workflows/typescript-compat.yml`
- `src/index.ts`, `src/cli/**`, and any directory-import resolution sites
- Removes `ts-node` + `typescript` pin from `pnpm-lock.yaml`