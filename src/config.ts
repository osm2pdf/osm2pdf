import minimist from 'minimist';
import { TileServer } from './types';
import { tileServers, parseUrl } from './tile-servers';
// TODO json-schema validation of input

// Generic options
type Mode = 'help' | 'map' | 'route' | 'tiles';

interface ModeConfig {
  mode: Mode;
}

interface BaseConfig extends ModeConfig {
  zoom: number;
  output: string;
  tileServer: TileServer;
  pageSizeX: number;
  pageSizeY: number;
  tmp: string;
}

export interface MapConfig extends BaseConfig {
  mode: 'map';
  north: number;
  west: number;
  south: number;
  east: number;
  boundary: boolean;
  content: boolean;
  links: boolean;
}

interface RouteConfig extends BaseConfig {
  mode: 'route';
  input: string;
  draw: boolean;
  distance: boolean;
  distanceStep: number;
}

interface HelpConfig extends ModeConfig {
  mode: 'help';
}

interface TilesConfig extends ModeConfig {
  mode: 'tiles';
}

export default function getConfig(): MapConfig | RouteConfig | HelpConfig | TilesConfig {
  const helpConfig: HelpConfig = { mode: 'help' };
  const tilesConfig: TilesConfig = { mode: 'tiles' };

  const argv = minimist(process.argv.slice(2));

  if (argv.h || argv.help) {
    return helpConfig;
  }

  if (argv['list-tile-servers']) {
    return tilesConfig;
  }

  if (argv.route || argv.map) {
    const baseConfig = {
      zoom: argv.zoom ?? 12,
      pageSizeX: argv.x ?? 4,
      pageSizeY: argv.y ?? 5,
      tileServer: getTileServer(argv['tile-server'], argv['rate-limit']),
      tmp: argv.tmp ?? `tmp${Date.now()}`,
    };

    if (argv.route) {
      const input = argv.input;
      if (!input) return helpConfig;

      return {
        ...baseConfig,
        mode: 'route',
        input,
        draw: !!(argv.path ?? true),
        distance: !!(argv.distance ?? true),
        distanceStep: argv['distance-step'] ?? 10,
        output:
          argv.output ||
          `route-${input
            .split('.')
            .slice(0, -1)
            .join('.')}-${baseConfig.zoom}`,
      };
    }

    if (argv.map) {
      const north: number = argv.n;
      const west: number = argv.w;
      const south: number = argv.s;
      const east: number = argv.e;

      if (
        typeof north !== 'number' ||
        typeof south !== 'number' ||
        typeof east !== 'number' ||
        typeof west !== 'number'
      )
        return helpConfig;

      const output = argv.output ?? `map_${north}_${west}_${south}_${east}_${baseConfig.zoom}`;

      return {
        ...baseConfig,
        mode: 'map',
        north,
        south,
        west,
        east,
        output,
        boundary: !!(argv.boundary ?? true),
        links: !!(argv.links ?? true),
        content: !!(argv.content ?? true),
      };
    }
  }

  return helpConfig;
}

function getTileServer(server: string | number, rateLimit: number = 10): TileServer {
  if (typeof server === 'number') {
    return tileServers[server - 1];
  } else {
    return {
      url: parseUrl(server),
      rateLimit,
    };
  }
}
