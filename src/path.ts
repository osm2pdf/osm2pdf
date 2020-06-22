import fs from 'fs-extra';
import { lat2tileExact, lon2tileExact } from './osm';
import { Tile, Page, PageSize, savePage, createPdf, clearTemporary } from './pdf';
import { pad } from './utils';
import gm from 'gm';
import * as vector from './vector';
import { parseRoute, Coordinate } from './route';
import log from './log';

const TILE_SIZE = 256;

type Path = Tile[];

interface PathPage extends Page {
  paths: Path[];
  position: number;
}

interface PageDict {
  [id: string]: PathPage;
}

export default async function path(
  { zoom, input }: { zoom: number; input: string },
  { sx, sy }: PageSize,
  output: string,
) {
  // get route
  const route = await parseRoute(input);
  // convert gps points to tile points
  const tileRoute = getTileRoute(route, zoom);
  // collect the pages in abstract form
  const pageDict = collectPages(tileRoute, sx, sy);

  // download the tiles and connect them to pages
  const tmp = `tmp${Date.now()}`;
  await fs.ensureDir(tmp);
  const pages = Object.values(pageDict);
  for (const page of pages) {
    // tslint:disable-next-line:no-shadowed-variable
    const { x, y, sx, sy, zoom, position } = page;
    const filename = `${tmp}/${pad(position)}.png`;
    // save page
    log(`${position + 1}/${pages.length} downloading`);
    await savePage({ x, y, sx, sy, zoom }, filename);
    // draw paths
    log(`${position + 1}/${pages.length} drawing`);
    await drawPaths(page, filename);
  }
  // make pdf from pages
  await createPdf(output, tmp);
  await clearTemporary(tmp);
  // tslint:disable-next-line:no-console
  console.log(`Finished! Your map was saved to ${output}.pdf`);
}

async function drawPaths(page: PathPage, filename: string) {
  await new Promise((resolve, reject) => {
    const control = gm(filename)
      .stroke('red', 2)
      .fill('#000f');
    // .fill('red');

    for (const tilePath of page.paths) {
      // tslint:disable-next-line:no-shadowed-variable
      const path = tilePath.map(point => ({
        x: (point.x - page.x) * TILE_SIZE,
        y: (point.y - page.y) * TILE_SIZE,
      }));

      if (path.length < 1) {
        path.forEach(point => {
          control.drawCircle(point.x, point.y, point.x + 3, point.y + 3);
        });
      } else {
        let lastPoint: vector.Vector | null;
        // tslint:disable-next-line:no-shadowed-variable
        path.forEach((point, i, path) => {
          let direction;
          if (i === 0) {
            direction = vector.normal(vector.unit(vector.diff(path[i + 1], path[i])));
          } else if (i === path.length - 1) {
            direction = vector.normal(vector.unit(vector.diff(path[i], path[i - 1])));
          } else {
            direction = vector.normal(
              vector.unit(
                vector.sum(
                  vector.unit(vector.diff(path[i], path[i - 1])),
                  vector.unit(vector.diff(path[i + 1], path[i])),
                ),
              ),
            );
          }
          const newPoint = vector.sum(point, vector.times(10, direction));
          // don't draw a point if it's too close to the last drawn point
          if (!lastPoint || vector.size(vector.diff(newPoint, lastPoint)) > 30) {
            control.drawCircle(newPoint.x, newPoint.y, newPoint.x + 3, newPoint.y + 3);
            lastPoint = newPoint;
          }
        });
      }
    }

    control.write(filename, err => {
      if (err) return reject(err);
      else return resolve();
    });
  });
}

function collectPages(tileRoute: Tile[], sx: number, sy: number): PageDict {
  const pageDict: PageDict = {};
  let currentPage = 0;
  for (const tile of tileRoute) {
    const pageX = Math.floor(tile.x / sx) * sx;
    const pageY = Math.floor(tile.y / sy) * sy;

    const id = `${pageX}-${pageY}`;
    if (!pageDict[id]) {
      pageDict[id] = {
        paths: [tileRoute],
        x: pageX,
        y: pageY,
        sx,
        sy,
        zoom: tile.zoom,
        position: currentPage++,
      };
    }
  }

  return pageDict;
}

function getTileRoute(route: Coordinate[], zoom: number): Tile[] {
  return route.map(({ lat, lon }) => ({
    x: lon2tileExact(lon, zoom),
    y: lat2tileExact(lat, zoom),
    zoom,
  }));
}
