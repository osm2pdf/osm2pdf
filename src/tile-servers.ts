import { TileServer } from './types';
import { random } from './utils';
import log from './log';

export const parseUrl = (a: string) => {
  const r = /^(?<base>.+?)\$?{(?<v1>[xyz]{1})}(?<s1>.+?)\$?{(?<v2>[xyz]{1})}(?<s2>.+?)\$?{(?<v3>[xyz]{1})}(?<end>.*)$/gm;
  const {
    groups: { base, v1, s1, v2, s2, v3, end },
  } = r.exec(a) as { groups: { [name: string]: string } };
  const r2 = /(?<base1>.*)({(?<servers>[a-z0-9|]+)})(?<base2>.*)/gm;
  const {
    groups: { base1, servers, base2 },
  } = (r2.exec(base) ?? { groups: { base1: base, servers: '', base2: '' } }) as { groups: { [name: string]: string } };

  return ({ x, y, z }: { x: number; y: number; z: number }) =>
    `${base1}${random(servers.split('|'))}${base2}${v1 === 'x' ? x : v1 === 'y' ? y : z}${s1}${
      v2 === 'x' ? x : v2 === 'y' ? y : z
    }${s2}${v3 === 'x' ? x : v3 === 'y' ? y : z}${end}`;
};

export const rawServers = [
  {
    name: 'German fork of the Standard tile layer: openstreetmap.de',
    url: 'https://{a|b|c}.tile.openstreetmap.de/{z}/{x}/{y}.png',
    rateLimit: 5,
  },
  {
    name: 'OSM France',
    url: 'https://{a|b|c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    rateLimit: 1,
  },
  {
    name: 'Humanitarian map style',
    url: 'http://{a|b}.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png',
    rateLimit: 1,
  },
  {
    name: 'OpenTopoMap',
    url: 'https://{a|b|c}.tile.opentopomap.org/{z}/{x}/{y}.png',
    rateLimit: 2,
  },
  {
    name: 'Stamen Toner Black & White map',
    url: 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png',
    rateLimit: 5,
  },
  {
    name: 'mapnik map grayscale',
    url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    rateLimit: 5,
  },
  {
    name: 'mapnik map without labels',
    url: 'https://tiles.wmflabs.org/osm-no-labels/${z}/${x}/${y}.png',
    rateLimit: 5,
  },
  {
    name: 'wmflabs Hike & Bike - Hiking map',
    url: 'https://tiles.wmflabs.org/hikebike/${z}/${x}/${y}.png',
    rateLimit: 1,
  },
  {
    name: 'Mapy.cz Base',
    url: 'https://m{1|2|3|4}.mapserver.mapy.cz/base-m/{z}-{x}-{y}',
    rateLimit: 10,
  },
  {
    name: 'Mapy.cz Turistic',
    url: 'https://m{1|2|3|4}.mapserver.mapy.cz/turist-m/{z}-{x}-{y}',
    rateLimit: 10,
  },
  {
    name: 'CyclOSM: OpenStreetMap-based bicycle map',
    url: 'https://{a|b|c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    rateLimit: 1,
  },
];

export const servers: TileServer[] = rawServers.map(({ url, rateLimit }) => ({
  url: parseUrl(url),
  rateLimit,
}));

export function listTileServers() {
  const output: string[] = [];

  output.push('');
  rawServers.forEach(({ name, url }, index) => {
    output.push(`${index + 1}. ${name}`);
    output.push(url);
    output.push('');
  });
  output.push('');

  return log(output.join('\n'));
}
