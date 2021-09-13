# OSM map to pdf

Generate pdf with [OpenStreetMap](https://openstreetmap.org) tiles.

![example output of osm2pdf with --route parameter](https://git.mrkvon.org/mrkvon/osm2pdf/raw/branch/master/example.png)

<!--
## Video

[![How to download OpenStreetMap with osm2pdf](https://img.youtube.com/vi/DiPj8yaXapA/0.jpg)](https://youtu.be/DiPj8yaXapA)
-->

## Install

```bash
sudo yarn global add osm2pdf
# or
sudo npm install -g osm2pdf
```

## Use


### Download a route

You need to provide a route in gpx format. You can download it e.g. on [graphhopper website](https://graphhopper.com/maps/) or bicycle planning website [cycle.travel](https://cycle.travel/map).

```bash
osm2pdf --route --zoom=10 --input=path/to/route.gpx --output=path/to/output --tile-server=1
```

### Download a map

You need to provide GPS boundaries of the area you want to download.

```bash
osm2pdf -n=70.923 -w=-4.373 -s=55.756 -e=27.872 --zoom=9 --output=path/to/output --tile-server=2
```

### Show available tile servers

```bash
osm2pdf --list-tile-servers
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

Tiles are provided by various [tile servers](https://wiki.openstreetmap.org/wiki/Tile_servers). Please use their resources responsibly and follow their respective usage policies.
