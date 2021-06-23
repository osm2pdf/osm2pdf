import { TileServer } from './types';

// const tileServer = 'http://a.tile.stamen.com/toner';
// const tileServer = 'https://a.tile.openstreetmap.de'
// const tileServer = 'https://tile.openstreetmap.org';
// const tileServer = 'https://tiles.wmflabs.org/bw-mapnik/'
// const tileServer = 'https://c.tile.openstreetmap.fr/osmfr'
//

export const servers: TileServer[] = [
  {
    url: ({ z, x, y }) => `https://a.tile.opentopomap.org/${z}/${x}/${y}.png`,
    rateLimit: 1,
  },
];

export default function listTileServers() {
  return 'tile servers listing TODO';
}
