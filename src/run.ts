#!/usr/bin/env node

// executable for routes
//
// if option route is specified, download a route
// e.g. --route --zoom=15 --input=route.xml --output=route --sx=4 --sy=5
//
// otherwise download a map (default)
// e.g. --zoom=15 --north= --south= --east= --west= --output=map --sx=4 --sy=5
//

import minimist from 'minimist';
import map from './map';
import route from './route';
import path from './path';
import help from './help';

(async () => {
  const argv = minimist(process.argv.slice(2));

  if (argv.h || argv.help) {
    help();
    return;
  }

  const zoom = argv.zoom ?? 12;

  if (zoom >= 17) {
    const SORRY =
      'Sorry, OSM Tile Usage Policy (https://operations.osmfoundation.org/policies/tiles/) forbids downloading tiles with zoom 17 and higher.';
    console.log(SORRY); // tslint:disable-line:no-console
    return;
  }

  const sx = argv.sx ?? 4;
  const sy = argv.sy ?? 5;
  const output = argv.output;

  if (argv.path) {
    const input = argv.input;

    const distanceStep = argv.distance ? argv['distance-step'] ?? 10 : -1;

    if (!input) return help();

    await path({ zoom, input }, { sx, sy }, distanceStep, output || 'path');
  } else if (argv.route) {
    const input = argv.input;

    if (!input) return help();

    await route({ zoom, input }, { sx, sy }, output || 'route');
  } else {
    const north = argv.n ?? argv.north;
    const west = argv.w ?? argv.west;
    const south = argv.s ?? argv.south;
    const east = argv.e ?? argv.east;

    if (typeof north !== 'number' || typeof south !== 'number' || typeof east !== 'number' || typeof west !== 'number')
      return help();

    await map(
      { zoom, north, west, south, east },
      { sx, sy },
      output || `map_${north}_${west}_${south}_${east}_${zoom}`,
    );
  }
})();
