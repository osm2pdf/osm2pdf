#!/usr/bin/env node

// executable for routes
//
// if option route is specified, download a route
// e.g. --route --zoom=15 --input=route.xml --output=route --sx=4 --sy=5
//
// otherwise download a map (default)
// e.g. --zoom=15 --north= --south= --east= --west= --output=map --sx=4 --sy=5
//
import getConfig from './config';
import map from './map';
import route from './route';
import help from './help';
import { listTileServers } from './tile-servers';

(async () => {
  try {
    const config = getConfig();

    switch (config.mode) {
      case 'tiles': {
        return listTileServers();
      }
      case 'map': {
        const { zoom, output, pageSizeX, pageSizeY, north, west, south, east, tileServer } = config;
        return map({ zoom, output, pageSizeX, pageSizeY, north, west, south, east, tileServer });
      }
      case 'route': {
        const { zoom, input, output, pageSizeX, pageSizeY, draw, distance, distanceStep, tileServer } = config;
        return route({ zoom, input, output, pageSizeX, pageSizeY, draw, distance, distanceStep, tileServer });
      }
      default:
        return help();
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(e));
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(e));
    // tslint:disable-next-line:no-console
    console.error(e);
  }
})();
