# OSM map to pdf

Generate pdf with [OpenStreetMap](https://openstreetmap.org) tiles.

## Video

[![How to download OpenStreetMap with osm2pdf](https://img.youtube.com/vi/dWjHL-pSyUA/0.jpg)](https://www.youtube.com/watch?v=dWjHL-pSyUA)

## Install

```bash
sudo yarn global add osm2pdf
# or
sudo npm install -g osm2pdf
```

## Use

### Download a map

You need to provide boundaries of the area you want to download.

```bash
osm2pdf --north=70.923 --west=-4.373 --south=55.756 --east=27.872 --zoom=9
```

### Download a route

You need to provide a route in gpx format. You can download it on [graphhopper website](https://graphhopper.com/maps/). Find your route and click _GPX export_ button.

```bash
osm2pdf --route --zoom=10 --input=path/to/route.gpx
```

## Help

```bash
osm2pdf -h
# or
osm2pdf --help
```

## Node compatibility

We use [ECMAScript Modules](https://nodejs.org/docs/latest/api/esm.html) which are supported since Node v8.

## Use responsibly

OpenStreetMap is run by a [not-for-profit foundation](https://wiki.osmfoundation.org/wiki/About). This application uses resources provided by them. Please read the [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/#bulk-downloading) and follow it. Use _osm2pdf_ responsibly and consider [donating to OSM Foundation](https://donate.openstreetmap.org/).

_The authors are not affiliated with OSM Foundation._
