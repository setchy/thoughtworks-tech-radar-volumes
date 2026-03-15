# Thoughtworks Technology Radar Volumes
[![CI Workflow][ci-workflow-badge]][github-actions] 
[![Refresh Workflow][refresh-workflow-badge]][github-actions] 
[![Renovate enabled][renovate-badge]][renovate]

> [!NOTE]  
> _This repository is a personal project and is not officially affiliated with Thoughtworks_

A CLI and complete collection of datasets for the popular [Thoughtworks Technology Radar][tw-radar], including all [archived volumes][tw-archive]

## Datasets

### How to use

There are a few ways you can use to view the interactive technology radar

1.  My own hosted radar with enhancements - [radar.setchy.io][setchy-radar]
2.  via my catalogue - [setchy.io/radars][setchy-radars]
3.  Thoughtworks hosted radar - [radar.thoughtworks.com][tw-byor]
4.  self-hosted BYOR radar - [thoughtworks/build-your-own-radar][github-byor]

### Available data formats

The technology radar datasets are provided in three formats; CSV, JSON and a combined Google Sheets document.

> [!IMPORTANT]
> _When using either the CSV or JSON data formats, please make sure to use the the GitHub RAW file URL (eg: [Volume 33][volumes-latest-csv])_

-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> [GitHub - Thoughtworks Volumes (CSV)][volumes-csv]
-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> [GitHub - Thoughtworks Volumes (JSON)][volumes-json]
-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> [Google Sheets - Thoughtworks Technology Radar Volumes][volumes-google-sheets]


### How are the datasets updated?

The CSV, JSON and Google Sheets datasets are automatically checked for any updates weekly.

> [!NOTE]
> _Thoughtworks typically publish a new technology radar volume twice per year._

## Command Line Interface (CLI)

### Getting Started

```
pnpm i && pnpm start help
```

### Usage

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
  help [command]    display help for command

Examples:
  $ tech-radar-volumes
  $ tech-radar-volumes fetch links
  $ tech-radar-volumes fetch data
  $ tech-radar-volumes volumes csv
  $ tech-radar-volumes help volumes
  $ tech-radar-volumes help
```

#### Subcommands

> [!NOTE]
> Commands that operate on existing data (`search`, `filter`, `stats`, `volumes`) require a populated `data/master.json` file. 
> Generate it with `tech-radar-volumes fetch data`.

<details>
<summary>volumes</summary>

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
</details>

<details>
<summary>fetch</summary>

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
</details>

<details>
<summary>search</summary>

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
</details>

<details>
<summary>filter</summary>

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
</details>

<details>
<summary>stats</summary>

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
</details>


#### Examples
```
  $ tech-radar-volumes
  $ tech-radar-volumes fetch links
  $ tech-radar-volumes fetch data
  $ tech-radar-volumes volumes csv
  $ tech-radar-volumes search -k react
  $ tech-radar-volumes search -k "test cafe" -o json
  $ tech-radar-volumes filter -v 10 -q "languages-and-frameworks" -o csv
  $ tech-radar-volumes stats --by=volume -o table
  $ tech-radar-volumes help volumes
  $ tech-radar-volumes help
```

<!-- LINK LABELS -->
<!-- Web -->
[setchy-radar]: https://radar.setchy.io
[setchy-radars]: https://setchy.io/radars

<!-- Badges -->
[github-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions
[ci-workflow-badge]: https://img.shields.io/github/actions/workflow/status/setchy/thoughtworks-tech-radar-volumes/ci.yml?logo=github&label=CI
[refresh-workflow-badge]: https://img.shields.io/github/actions/workflow/status/setchy/thoughtworks-tech-radar-volumes/data-refresh.yml?logo=github&label=Data+Refresh
[renovate]: https://github.com/setchy/thoughtworks-tech-radar-volumes/issues/3
[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate&logoColor=white

<!-- Volumes -->
[volumes-latest-csv]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2033%20(Nov%202025).csv
[volumes-csv]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv
[volumes-json]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json
[volumes-google-sheets]: https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing

<!-- Thoughtworks -->
[tw-archive]: https://www.thoughtworks.com/radar/archive
[tw-byor]: https://radar.thoughtworks.com/
[tw-radar]: https://www.thoughtworks.com/radar
[github-byor]: https://github.com/thoughtworks/build-your-own-radar
