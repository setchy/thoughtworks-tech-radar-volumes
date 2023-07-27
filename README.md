# Thoughtworks Technology Radar Volumes

> This repository is a personal project and is not officially affiliated with Thoughtworks

A collection of datasets for the [latest Thoughtworks Technology Radar](https://www.thoughtworks.com/radar) and all [archived volumes](https://www.thoughtworks.com/radar/archive)

## Getting started

You can use any of the below `Data Formats` with either

1.  self-hosted BYOR radar - [thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar#using-csv-data)
2.  Thoughtworks hosted - [radar.thoughtworks.com](https://radar.thoughtworks.com/)

## Available data formats

The following three data formats are currently supported:

-   <img src="./assets/google-sheets-icon.svg" width="24" height="24" alt="Google Sheets" /> [Google Sheets - Thoughtworks Technology Radar Volumes](https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing)
-   <img src="./assets/csv-icon.png" width="26" height="26" alt="CSV"></img> [GitHub - Thoughtworks Volumes (CSV)](https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/21ee7c0a7fa6716f0c0d64d68aea320405f1e846/volumes/csv)
-   <img src="./assets/json-icon.png" width="26" height="26" alt="JSON"></img> [GitHub - Thoughtworks Volumes (JSON)](https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/21ee7c0a7fa6716f0c0d64d68aea320405f1e846/volumes/json)

_Note: to use the CSV data formats you will need to use the GitHub RAW file URL (eg: [Volume 28](<https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/Thoughtworks%20Technology%20Radar%20Volume%2028%20(Apr%202023).csv>))_

## How are the datasets updated?

The datasets are manually refreshed every 6 months in alignment with Thoughtworks officially publishing their latest Volume.

The process for generating the CSVs has been automated.

### /api-parser (recommended)

The latest implementation which uses the public Thoughtworks Radar Search REST API.

To execute, simply run `npm start`.

### /web-scraper (deprecated)

The original implementation which used a three-step process of parsing the public HTML content.

#### npm run generate:links

This will extract _all_ blip links from the https://thoughtworks.com/radar/search and place into `data/links.json`

#### npm run generate:data

Using the contents of `data/links.json`, fetch each of the publication entries and place into `data/master.json`

### npm run generate:csv

Using the contents of `data/master.json`, generate CSV files for each publication/volume and place into `volumes/*`
