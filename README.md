# Thoughtworks Technology Radar Volumes
[![CI Workflow][ci-workflow-badge]][github-actions] [![Refresh Workflow][refresh-workflow-badge]][github-actions] [![Quality Gate Status][quality-badge]][quality] [![Renovate enabled][renovate-badge]][renovate] [![License][license-badge]][license]

> 📡 **From blip to big picture:** follow technology ideas through the [Thoughtworks Technology Radar][tw-radar], from today’s signals back through every [archived edition][tw-archive].

![Thoughtworks Technology Radar Volumes][social]

A CLI and complete collection of datasets for the Thoughtworks Technology Radar — every published volume normalized and published as **CSV**, **JSON**, and a combined **Google Sheets** document, kept fresh by an automated weekly pipeline.

---

## ✨ Features

- 🗂️ **Complete archive** — every published radar volume, including archived ones, normalized into a single master dataset (34 volumes, ~3,300 blip entries)
- 📄 **Three formats, one dataset** — each volume is published as CSV, JSON, and a combined Google Sheets document, all generated from the same source
- 🔄 **Always fresh** — datasets are automatically re-checked weekly, and any changes land via an automated pull request
- 🖥️ **Powerful CLI** — search, filter, stats, validate, and volume generation with `text`, `json`, `jsonl`, `csv`, and `table` output
- 🏷️ **Canonical ring naming** — rings are reported consistently (e.g. `caution`) across the full dataset history

## 🛠️ Built with

- ⚡ [Node.js 24+][nodejs] — native TypeScript runtime, zero build step
- 🖥️ [Commander][commander] — CLI framework
- 🕸️ [Cheerio][cheerio] — fetching and parsing the radar site
- 📊 [Google Sheets API][google-sheets] — combined dataset publishing
- 🧪 [Vitest][vitest] — unit testing
- 🧹 [Biome][biome] — linting and formatting
- 📦 [pnpm][pnpm] — fast, disk-efficient package manager
- 🤖 [GitHub Actions][github-actions] — CI and automated weekly refresh

## 🚀 Quick Start

### 📋 Prerequisites

- 📦 Node.js 24+ (see `.nvmrc`) and [pnpm][pnpm]

### 🔧 Run the CLI

```shell
pnpm i && pnpm start help
```

`pnpm start` is shorthand for `node src/index.ts` — no build step required. See the [CLI reference][contrib] in CONTRIBUTING.md for the full command documentation.

### 🗺️ View the radar

1. 🎯 My hosted radar with enhancements — [radar.setchy.io][setchy-radar]
2. 📚 Via my catalogue — [setchy.io/radars][setchy-radars]
3. 🔍 Thoughtworks hosted radar — [radar.thoughtworks.com][tw-byor]
4. 🛠️ Self-hosted BYOR radar — [thoughtworks/build-your-own-radar][github-byor]

## 📊 Datasets

### 📦 Available formats

> [!IMPORTANT]
> _When using either the CSV or JSON data formats, please make sure to use the GitHub RAW file URL (eg: [Volume 34 CSV][volumes-latest-csv])_

-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> **CSV** — [GitHub - Thoughtworks Volumes][volumes-csv]
-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> **JSON** — [GitHub - Thoughtworks Volumes][volumes-json]
-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> **Google Sheets** — [Thoughtworks Technology Radar Volumes][volumes-google-sheets]

### 📝 Data notes

- **🏷️ Canonical ring naming**: Thoughtworks renamed the "Hold" ring to "Caution" in Volume 34 (Apr 2026). Across all output formats (CSV, JSON, Google Sheets) the ring is reported using the canonical name `caution`, so the same ring is consistently named across the full dataset history.
- **📭 Missing descriptions**: Blips in Volumes 1-14 often have an empty description. This is not a data-processing gap — the source pages genuinely contain no description for those entries. Volumes 15+ always include descriptions.

### 🔄 Refresh cadence

- 📅 **Weekly checks** — a [GitHub Action][refresh-workflow-actions] re-fetches the datasets every Sunday; any changes are reviewed and merged via an automated pull request
- 📈 **New volumes** — Thoughtworks typically publish a new technology radar volume **twice per year**, which is when the dataset grows
- ⚡ **On-demand** — the refresh workflow can also be triggered manually at any time from the Actions tab

For the full refresh pipeline, see [CONTRIBUTING.md][contrib]. 🔄

## 🧭 Using the CLI

```text
Usage: tech-radar-volumes [options] [command]

Commands:
  fetch      group commands for fetching/ingesting data
  volumes    generate publication volumes in specified format(s)
  search     search master dataset for a keyword (defaults to name and description)
  filter     filter master dataset by volume, quadrant, ring or status
  stats      show statistics for the master dataset
  validate   check the master dataset for data quality issues
```

Try a few examples:

```shell
tech-radar-volumes search -k react
tech-radar-volumes filter -v 10 -q "languages-and-frameworks" -o csv
tech-radar-volumes stats --by=quadrant -o json
tech-radar-volumes volumes json
```

> [!NOTE]
> Commands that operate on existing data (`search`, `filter`, `stats`, `volumes`) require a populated `data/master.json` file.
> Generate it with `tech-radar-volumes fetch data`.

For the full command reference — options, subcommands and more examples — see [CONTRIBUTING.md][contrib]. 📚

## 🤝 Contributing

Contributions are welcome! 🎉

- Open an [issue][github-issues] for bugs or feature requests.
- See [CONTRIBUTING.md][contrib] for development setup, the full CLI reference, data refresh details, and troubleshooting.

## 📜 License

⚖️ The code in this repository is licensed under the [ISC License][license].

📊 The radar datasets remain © Thoughtworks and are redistributed under their published terms.

ℹ️ This project is a personal project and is not officially affiliated with Thoughtworks.

<!-- Links -->
[social]: ./assets/social.png
[github-issues]: https://github.com/setchy/thoughtworks-tech-radar-volumes/issues
[github-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions
[refresh-workflow-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions/workflows/data-refresh.yml

[ci-workflow-badge]: https://img.shields.io/github/actions/workflow/status/setchy/thoughtworks-tech-radar-volumes/ci.yml?logo=github&label=CI
[refresh-workflow-badge]: https://img.shields.io/github/actions/workflow/status/setchy/thoughtworks-tech-radar-volumes/data-refresh.yml?logo=github&label=Data+Refresh
[renovate]: https://github.com/setchy/thoughtworks-tech-radar-volumes/issues/3
[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate&logoColor=white
[quality]: https://sonarcloud.io/summary/new_code?id=setchy_thoughtworks-tech-radar-volumes
[quality-badge]: https://img.shields.io/sonar/quality_gate/setchy_thoughtworks-tech-radar-volumes?server=https%3A%2F%2Fsonarcloud.io&logo=sonarqubecloud
[license-badge]: https://img.shields.io/github/license/setchy/thoughtworks-tech-radar-volumes?logo=github
[license]: LICENSE

[volumes-latest-csv]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2034%20(Apr%202026).csv
[volumes-csv]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv
[volumes-json]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json
[volumes-google-sheets]: https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing

[setchy-radar]: https://radar.setchy.io
[setchy-radars]: https://setchy.io/radars
[tw-archive]: https://www.thoughtworks.com/radar/archive
[tw-byor]: https://radar.thoughtworks.com/
[tw-radar]: https://www.thoughtworks.com/radar
[github-byor]: https://github.com/thoughtworks/build-your-own-radar

[contrib]: CONTRIBUTING.md
[pnpm]: https://pnpm.io
[nodejs]: https://nodejs.org
[commander]: https://github.com/tj/commander.js
[cheerio]: https://cheerio.js.org
[google-sheets]: https://developers.google.com/sheets/api
[vitest]: https://vitest.dev
[biome]: https://biomejs.dev
