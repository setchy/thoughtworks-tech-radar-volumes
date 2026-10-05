# Contributing to Thoughtworks Technology Radar Volumes

Thanks for your interest in contributing! 🎉

This guide covers the developer and maintainer side of the project — development setup, project layout, the full CLI reference, refreshing the datasets, publishing to Google Sheets, and troubleshooting. For using the datasets and the CLI, see the [README](README.md).

## 🛠️ Development setup

Requires Node.js 24+ and [pnpm][pnpm] (see `.nvmrc` for the pinned Node version).

```shell
pnpm install
pnpm start help
```

`pnpm start` is shorthand for `node src/index.ts` — the CLI runs directly on Node's native TypeScript support, no build step required.

### 📜 Scripts

| Command | Description |
| --- | --- |
| `pnpm start` | Run the CLI (`node src/index.ts`) |
| `pnpm build` | Compile to `dist/` with `tsc` |
| `pnpm typecheck` | Run `tsc --noEmit` without emitting |
| `pnpm lint` | Auto-fix formatting/linting with [Biome][biome] |
| `pnpm lint:check` | Check formatting/linting with Biome |
| `pnpm test` | Run the [Vitest][vitest] test suite |

## 📦 Project structure

- `src/cli/` — Commander-based CLI wiring, `commands/` and `examples.ts`
- `src/ingest/` — data fetching: `links/` (sitemap parsing) and `timeline/` (per-blip history scraping)
- `src/operations/` — pure data operations: `search`, `filter`, `stats`, `health`
- `src/output/` — dataset writers: `csv.ts`, `json.ts`, `googleSheets.ts`
- `src/data/` — shared data structures (e.g. `repository.ts`)
- `src/shared/` — constants, zod schemas, types and logger
- `data/` — generated datasets: `search-links.json` and `search-data.json`
- `volumes/` — generated publication volumes (`csv/`, `json/`)
- `test/` — Vitest test suite, with `test/fixtures/`
- `assets/` — icons and social image used in the README

## ⚙️ CLI reference

```text
Usage: tech-radar-volumes [options] [command]

A CLI tool to fetch and process ThoughtWorks Tech Radar data

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  fetch             group commands for fetching/ingesting data
  volumes [type]    generate publication volumes in specified format(s).
                    Inputs: requires `data/master.json`.
                    Output: generated volumes will be saved in `volumes/*`.
  search [options]  search master dataset for a keyword (defaults to name and
                    description)
  filter [options]  filter master dataset by volume, quadrant, ring or status
  stats [options]   show statistics for the master dataset
  validate [options] check the master dataset for data quality issues
  help [command]    display help for command

Examples:
  $ tech-radar-volumes
  $ tech-radar-volumes fetch links
  $ tech-radar-volumes fetch data
  $ tech-radar-volumes volumes csv
  $ tech-radar-volumes stats --by=quadrant -o json
  $ tech-radar-volumes search -k react
  $ tech-radar-volumes search -k "test cafe" -o json
  $ tech-radar-volumes filter -v 10 -q "languages-and-frameworks" -o csv
  $ tech-radar-volumes stats --by=volume -o table
  $ tech-radar-volumes help volumes
  $ tech-radar-volumes help
```

> [!NOTE]
> Commands that operate on existing data (`search`, `filter`, `stats`, `volumes`) require a populated `data/master.json` file.
> Generate it with `tech-radar-volumes fetch data`.

### 📂 `volumes`

```text
Usage: tech-radar-volumes volumes [options] [type]

generate publication volumes in specified format(s).
Inputs: requires `data/master.json`.
Output: generated volumes will be saved in `volumes/*`.

Arguments:
  type        type of report to generate (choices: "all", "csv", "json",
              "google-sheets", default: "all")

Options:
  -h, --help  display help for command
```

### 📥 `fetch`

```text
Usage: tech-radar-volumes fetch [options] [command]

group commands for fetching/ingesting data

Options:
  -h, --help      display help for command

Commands:
  links           fetch blip page links from sitemap
  data            fetch detailed blip history and write data/master.json
  all             run links, data and generate volumes
  help [command]  display help for command
```

### 🔍 `search`

```text
Usage: tech-radar-volumes search [options]

search master dataset for a keyword (defaults to name and description)

Options:
  -k, --keyword <keyword>  keyword to search for
  -f, --field <field>      specific field to search (name, quadrant, ring,
                           description)
  -v, --volume <volume>    filter by volume number or name
  -o, --output <format>    output format: text|json|jsonl|csv|table (default:
                           "text")
  -h, --help               display help for command
```

### 🧹 `filter`

```text
Usage: tech-radar-volumes filter [options]

filter master dataset by volume, quadrant, ring or status

Options:
  -v, --volume <volume>      filter by volume number or name
  -q, --quadrant <quadrant>  filter by quadrant
  -r, --ring <ring>          filter by ring
  -s, --status <status>      filter by status (new|moved in|moved out|no change)
  -o, --output <format>      output format: text|json|jsonl|csv|table (default:
                             "text")
  -h, --help                 display help for command
```

### 📈 `stats`

```text
Usage: tech-radar-volumes stats [options]

show statistics for the master dataset

Options:
  -b, --by <group>       group stats by: volume|quadrant|ring|all (default:
                         "all")
  -o, --output <format>  output format: text|json|jsonl|csv|table (default:
                         "text")
  -h, --help             display help for command
```

### 🩺 `validate`

```text
Usage: tech-radar-volumes validate [options]

check the master dataset for data quality issues

Options:
  -o, --output <format>  output format: text|json (default: "text")
  -h, --help             display help for command
```

## 🔄 Refreshing the datasets

The datasets are produced by a single TypeScript CLI that fetches the radar sitemap, scrapes each blip's timeline, and regenerates every volume from the combined dataset:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA PIPELINE OVERVIEW                       │
│                                                                      │
│                        thoughtworks.com/radar                        │
│                              │                                       │
│                              ▼   fetch sitemap                       │
│  ┌──────────────────┐  (regex + sort)  ┌──────────────────┐          │
│  │    Radar Sitemap │ ─────────────────▶│   search-links   │          │
│  │       .xml       │                   │      .json       │ ~1,938   │
│  └──────────────────┘                   └────────┬─────────┘  links  │
│                                                  │                  │
│                                                  ▼  per blip        │
│                                     ┌───────────────────────┐        │
│                                     │  extractBlipTimeline  │        │
│                                     │  fetch + parse        │        │
│                                     │  (cheerio DOM scrape) │        │
│                                     └───────────┬───────────┘        │
│                                                 ▼                   │
│                              ┌────────────────────────┐  ~3,309     │
│                              │     search-data.json   │   rows      │
│                              │  (combined master set) │  34 volumes │
│                              └───────────┬────────────┘             │
│                                          ▼                          │
│                      ┌───────────────────┼───────────────────┐      │
│                      ▼                   ▼                   ▼      │
│               ┌──────────────┐   ┌──────────────┐   ┌──────────────┐│
│               │  CSV × 34    │   │  JSON × 34   │   │Google Sheets ││
│               └──────────────┘   └──────────────┘   └──────────────┘│
│                                                                      │
│   Weekly GitHub Action → fetch all → lint → automated PR             │
└──────────────────────────────────────────────────────────────────────┘
```

### Locally

```shell
pnpm start fetch all
pnpm lint
```

This runs `links`, `data` and regenerates all volumes. Outputs land in `data/` and `volumes/`.

### ☁️ Google Sheets

The [Google Sheets sync workflow][google-sheets-actions] publishes the combined dataset to Google Sheets and can be triggered manually from the Actions tab. It requires the following repository variables/secrets:

- `GOOGLE_SHEET_ID` (variable)
- `GOOGLE_CLIENT_EMAIL` (secret)
- `GOOGLE_PRIVATE_KEY` (secret)

To run the Google Sheets sync locally, export the same variables and run `pnpm start volumes google-sheets`.

### 🤖 Automated refresh

The [Refresh Volumes workflow][data-refresh-actions] runs every **Sunday at midnight UTC** (and can be triggered manually via `workflow_dispatch`). It:

1. Refreshes all radar datasets and regenerates every volume
2. Lints the results
3. Opens (or updates) an automated pull request on the `automated/volume-updates` branch when the data has changed

## 🧪 Tests & linting

```shell
pnpm typecheck
pnpm test
pnpm lint:check
```

- **Type checking** — `tsc --noEmit`
- **Tests** — [Vitest][vitest] under `test/`
- **Formatting & linting** — [Biome][biome]; run `pnpm lint` to auto-fix

The [CI workflow][github-actions] runs `pnpm lint:check`, `pnpm typecheck` and `pnpm test` on every push and pull request to `main`, so make sure everything passes locally before submitting a PR.

## 🛠️ Troubleshooting

- 🚫 **`search`, `filter`, `stats` or `volumes` error about missing data**: you need a populated `data/master.json` — run `pnpm start fetch data` first.
- 🌐 **Google Sheets sync fails**: verify `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set (and not expired) in your environment or repository secrets.
- 🧪 **Tests failing locally**: ensure you're on the pinned Node version (`.nvmrc`) and have run `pnpm install`, then `pnpm typecheck` and `pnpm test`.

## 🙏 Getting help

- Open an [issue][github-issues] for bugs or feature requests.
- See [README.md](README.md) for usage and the dataset overview.

<!-- Links -->
[biome]: https://biomejs.dev/
[vitest]: https://vitest.dev/
[pnpm]: https://pnpm.io
[github-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions
[google-sheets-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions/workflows/google-sheets.yml
[data-refresh-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions/workflows/data-refresh.yml
[github-issues]: https://github.com/setchy/thoughtworks-tech-radar-volumes/issues