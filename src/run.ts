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

  const zoom = Number(argv.zoom || 12);

  if (zoom >= 17) {
    const SORRY =
      'Sorry, OSM Tile Usage Policy (https://operations.osmfoundation.org/policies/tiles/) forbids downloading tiles with zoom 17 and higher.';
    console.log(SORRY); // tslint:disable-line:no-console
    return;
  }

  const sx = Number(argv.sx || 4);
  const sy = Number(argv.sy || 5);
  const output = argv.output;

  if (argv.path) {
    const input = argv.input;

    if (!input) return help();

    await path({ zoom, input }, { sx, sy }, output || 'path');
  } else if (argv.route) {
    const input = argv.input;

    if (!input) return help();

    await route({ zoom, input }, { sx, sy }, output || 'route');
  } else {
    if (!argv.n || !argv.s || !argv.w || !argv.e) return help();

    const north = Number(argv.n || argv.north);
    const west = Number(argv.w || argv.west);
    const south = Number(argv.s || argv.south);
    const east = Number(argv.e || argv.east);

    await map(
      { zoom, north, west, south, east },
      { sx, sy },
      output || `map_${north}_${west}_${south}_${east}_${zoom}`,
    );
  }
})();
