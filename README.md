# Thoughtworks Technology Radar - Datasets

A collection of datasets for the [latest Thoughtworks Technology Radar](https://www.thoughtworks.com/radar) and all [archived volumes](https://www.thoughtworks.com/radar/archive)

### How to use with build-your-own-radar

You can use any of the `volumes/*` datasets with either

-   self-hosted [thoughtworks/build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar#using-csv-data)
-   hosted https://radar.thoughtworks.com/

Remember, you will need to use the GitHub RAW file URL for these to work while hosted in GitHub (eg: [Volume 28](https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/Thoughtworks%20Technology%20Radar%20Volume%2028.csv))

### How to refresh datasets

This repository contains the following scripts

#### npm run generate:links

This will extract _all_ blip links from the https://thoughtworks.com/radar/search and place into `data/links.json`

#### npm run generate:data

Using the contents of `data/links.json`, fetch each of the publication entries and place into `data/master.json`

### npm run generate:csv

Using the contents of `data/master.json`, generate CSV files for each publication/volume and place into `volumes/*`
