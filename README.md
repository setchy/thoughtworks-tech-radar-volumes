# Thoughtworks Technology Radar Volumes

> [!NOTE]  
> _This repository is a personal project and is not officially affiliated with Thoughtworks_

A complete collection of datasets for the popular [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar), including all [archived volumes](https://www.thoughtworks.com/radar/archive)

## Usage

### How to use

There are a few ways you can use to view the interactive technology radar

1.  via [setchy.io/radars](https://setchy.io/radars)
2.  Thoughtworks hosted radar - [radar.thoughtworks.com](https://radar.thoughtworks.com/)
3.  self-hosted BYOR radar - [thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar)

### Available data formats

The dataset collection is provided in three format:

-   <img src="./assets/google-sheets-icon.svg" width="24" height="24" alt="Google Sheets" /> [Google Sheets - Thoughtworks Technology Radar Volumes](https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing)
-   <img src="./assets/csv-icon.png" width="26" height="26" alt="CSV"></img> [GitHub - Thoughtworks Volumes (CSV)](https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv)
-   <img src="./assets/json-icon.png" width="26" height="26" alt="JSON"></img> [GitHub - Thoughtworks Volumes (JSON)](https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json)

> [!IMPORTANT] > _When using either the CSV or JSON data formats, please make sure to use the the GitHub RAW file URL (eg: [Volume 29](<https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2029%20(Sep%202023).csv>))_

## How are the datasets updated?

The datasets are refreshed every 6 months in alignment with Thoughtworks officially publishing their latest Volume.

The process for generating the CSVs and JSON volumes has been automated.

### /web-scraper (recommended)

An implementation which used a three-step process of parsing the public HTML content.

```
Usage: tech-radar-volumes [options]

A CLI tool to fetch and process ThoughtWorks Tech Radar data

Options:
  -l, --links           fetch all radar blip page links from archive
  -d, --data            fetch detailed blip history from archive
  -v, --volumes <type>  generate CSV and JSON volumes (choices: "all", "csv", "json")
  -h, --help            display help for command
```

You can run this CLI via `pnpm start --help`

#### --links

This will extract _all_ blip links from the https://thoughtworks.com/radar/search and place into `data/links.json`

#### --data

Using the contents of `data/links.json`, fetch each of the publication entries and place into `data/master.json`

### --volumes

Using the contents of `data/master.json`, generate CSV and JSON files for each publication/volume and place into `volumes/*`
