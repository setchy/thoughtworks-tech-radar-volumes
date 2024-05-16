# Thoughtworks Technology Radar Volumes

> [!NOTE]  
> _This repository is a personal project and is not officially affiliated with Thoughtworks_

A complete collection of datasets for the popular [Thoughtworks Technology Radar][tw-radar], including all [archived volumes][tw-archive]

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
> _When using either the CSV or JSON data formats, please make sure to use the the GitHub RAW file URL (eg: [Volume 30][latest-csv])_

-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> [GitHub - Thoughtworks Volumes (CSV)][volumes-csv]
-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> [GitHub - Thoughtworks Volumes (JSON)][volumes-json]
-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> [Google Sheets - Thoughtworks Technology Radar Volumes][volumes-google-sheets]


### How are the datasets updated?

The CSV and JSON datasets are automatically checked for any updates weekly.  For Google Sheets, this is currently manual.

_Note: Thoughtworks typically publish a new technology radar volume twice per year.

## Command Line Interface (CLI)

The CLI has three main functions to assist with the dataset automation.

```
Usage: tech-radar-volumes [options]

A CLI tool to fetch and process ThoughtWorks Tech Radar data

Options:
  -l, --links           fetch all radar blip page links from archive
  -d, --data            fetch detailed blip history from archive
  -v, --volumes <type>  generate CSV and JSON volumes (choices: "all", "csv", "json", "google-sheets")
  -h, --help            display help for command
```

You can run this CLI via `pnpm start --help`

### --links

This will extract _all_ blip links from the [Thoughtworks Radar Search][tw-search] and place into `data/links.json`

### --data

Using the contents of `data/links.json`, fetch each of the publication entries and place into `data/master.json`

### --volumes

Using the contents of `data/master.json`, generate CSV and JSON files for each publication/volume and place into `volumes/*`

<!-- LINK LABELS -->
<!-- Web -->
[setchy-radar]: https://radar.setchy.io
[setchy-radars]: https://setchy.io/radars

<!-- Volumes -->
[latest-csv]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2030%20(Apr%202024).csv
[volumes-csv]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv
[volumes-json]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json
[volumes-google-sheets]: https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing

<!-- Thoughtworks -->
[tw-archive]: https://www.thoughtworks.com/radar/archive
[tw-byor]: https://radar.thoughtworks.com/
[tw-radar]: https://www.thoughtworks.com/radar
[tw-search]: https://thoughtworks.com/radar/search

[github-byor]: https://github.com/thoughtworks/build-your-own-radar
