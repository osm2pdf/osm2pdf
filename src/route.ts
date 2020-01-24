import xml2js from 'xml2js';
import fs from 'fs-extra';
import { promisify } from 'util';
import { lat2tile, lon2tile } from './osm';
import { pages2pdf, Tile, Page, PageSize } from './pdf';

const parseString = promisify(xml2js.parseString);

export default async function route(
  { zoom, input }: { zoom: number; input: string },
  pageSize: PageSize,
  output: string,
) {
  // get route
  // tslint:disable-next-line:no-shadowed-variable
  const route = await parseRoute(input);
  // get tile for each route point
  const tiles = route2tiles(route, zoom);
  const pages = tiles2pages(tiles, pageSize);
  await pages2pdf(pages, output);
}

interface Coordinate {
  lat: number;
  lon: number;
}

interface StringCoordinate {
  lat: string;
  lon: string;
}

interface Route {
  gpx: {
    trk: {
      trkseg: {
        trkpt: {
          $: StringCoordinate;
        }[];
      }[];
    }[];
  };
}

async function parseRoute(file: string): Promise<Coordinate[]> {
  const xml = (await fs.readFile(file)).toString();
  const raw = (await parseString(xml)) as Route;
  return raw.gpx.trk[0].trkseg[0].trkpt.map(({ $: { lat, lon } }) => ({ lat: +lat, lon: +lon }));
}

// tslint:disable-next-line:no-shadowed-variable
function route2tiles(route: Coordinate[], zoom: number): Tile[] {
  const tiles: Tile[] = [];
  // add tile for each route point
  route.forEach(({ lat, lon }) => {
    const tile: Tile = {
      x: lon2tile(+lon, zoom),
      y: lat2tile(+lat, zoom),
      zoom,
    };

    const found = tiles.findIndex(({ x, y }) => x === tile.x && y === tile.y);
    if (found === -1) tiles.push(tile);
  });

  return tiles;
}

function tiles2pages(tiles: Tile[], { sx, sy }: PageSize): Page[] {
  const pages: Page[] = [];
  tiles.forEach(({ x, y, zoom }) => {
    const page: Page = {
      x: Math.floor(x / sx) * sx,
      y: Math.floor(y / sy) * sy,
      sx,
      sy,
      zoom,
    };

    // tslint:disable-next-line:no-shadowed-variable
    const found = pages.findIndex(({ x, y }) => x === page.x && y === page.y);
    if (found === -1) {
      pages.push(page);
    }
  });

  return pages;
}
