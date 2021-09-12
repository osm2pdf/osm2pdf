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
import chalk from 'chalk';

(async () => {
  let config;
  try {
    config = getConfig();

    switch (config.mode) {
      case 'tiles': {
        listTileServers();
        return;
      }
      case 'map': {
        await map(config);
        return;
      }
      case 'route': {
        await route(config);
        return;
      }
      default:
        help();
        return;
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(e));
    // tslint:disable-next-line:no-console
    console.error(e);
    if (config && 'tmp' in config) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.red(
          `\n\n************************\n\nError: ${e.message}\n\nYour download failed. You can resume it by adding "--tmp ${config.tmp}" to your command.\n\n************************\n`,
        ),
      );
    }
  }
})();
