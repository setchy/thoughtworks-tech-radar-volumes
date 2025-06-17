# Thoughtworks Technology Radar Volumes
[![CI Workflow][ci-badge]][github-actions] 
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
> _When using either the CSV or JSON data formats, please make sure to use the the GitHub RAW file URL (eg: [Volume 31][volumes-latest-csv])_

-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> [GitHub - Thoughtworks Volumes (CSV)][volumes-csv]
-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> [GitHub - Thoughtworks Volumes (JSON)][volumes-json]
-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> [Google Sheets - Thoughtworks Technology Radar Volumes][volumes-google-sheets]


### How are the datasets updated?

The CSV and JSON datasets are automatically checked for any updates weekly.  For Google Sheets, this is currently manual.

> [!NOTE]
> _Thoughtworks typically publish a new technology radar volume twice per year._

## Command Line Interface (CLI)

### Getting Started

```
pnpm i && pnpm start help
```

### Usage

```
Usage: tech-radar-volumes [options] [command]

A CLI tool to fetch and process ThoughtWorks Tech Radar data

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  all             fetch detailed history for all blips and generate publication volumes
  links           fetch all radar blip page links from web.
                  Output: blip links will be saved in `data/links.json`.
  data            fetch detailed blip history from web.
                  Inputs: requires `data/links.json`.
                  Output: detailed history will be saved in `data/master.json`.
  volumes [type]  generate publication volumes in specified format(s).
                  Inputs: requires `data/master.json`.
                  Output: generated volumes will be saved in `volumes/*`.
  help [command]  display help for command

Examples:
  $ tech-radar-volumes
  $ tech-radar-volumes links
  $ tech-radar-volumes data
  $ tech-radar-volumes volumes csv
  $ tech-radar-volumes help volumes
  $ tech-radar-volumes help
```

<!-- LINK LABELS -->
<!-- Web -->
[setchy-radar]: https://radar.setchy.io
[setchy-radars]: https://setchy.io/radars

<!-- Badges -->
[github-actions]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions
[ci-workflow-badge]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions/workflows/ci.yml/badge.svg
[refresh-workflow-badge]: https://github.com/setchy/thoughtworks-tech-radar-volumes/actions/workflows/data-refresh.yml/badge.svg
[renovate]: https://renovatebot.com/
[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate

<!-- Volumes -->
[volumes-latest-csv]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2032%20(Apr%202025).csv
[volumes-csv]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv
[volumes-json]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json
[volumes-google-sheets]: https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing

<!-- Thoughtworks -->
[tw-archive]: https://www.thoughtworks.com/radar/archive
[tw-byor]: https://radar.thoughtworks.com/
[tw-radar]: https://www.thoughtworks.com/radar
[github-byor]: https://github.com/thoughtworks/build-your-own-radar
