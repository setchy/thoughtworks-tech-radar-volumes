## 1. Runtime Migration

- [x] 1.1 Add `"type": "module"` to package.json
- [x] 1.2 Fix directory imports and any ESM-incompatible resolution across src/
- [x] 1.3 Switch `pnpm start` to `node src/index.ts`
- [x] 1.4 Verify `fetch links`, `volumes csv`, `search`, `filter`, `stats` all run under native Node
- [x] 1.5 Verify `tsc --noEmit` still passes after the migration

## 2. Dependency Cleanup

- [x] 2.1 Remove the `ts-node` dependency
- [x] 2.2 Remove the TypeScript version pin (keep latest-compatible TypeScript as devDependency)
- [x] 2.3 Delete `.github/workflows/typescript-compat.yml`
- [x] 2.4 Prune pnpm-lock.yaml and run a clean install

## 3. Package Metadata

- [x] 3.1 Add a `build` script (tsc) and a `typecheck` script
- [x] 3.2 Align `main` with real build output (or remove the misleading field)
- [x] 3.3 Document that consumption runs via `node src/index.ts`

## 4. Logger

- [x] 4.1 Add a minimal logger module (info/warn/error)
- [x] 4.2 Replace scattered `console.*` calls in src/ with the logger
- [x] 4.3 Keep log output compatible with existing workflow expectations