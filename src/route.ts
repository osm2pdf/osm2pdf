import { lat2tileExact, lon2tileExact } from './osm';
import { createPdf } from './pdf';
import { clearTmp, getFilename } from './utils';
import gm from 'gm';
import * as vector from './vector';
import log from './log';
import * as nodePath from 'path';
import haversine from 'haversine';
import { Tile, Page, TileServer } from './types';
import { downloadPages } from './download';
import { Coordinate, parseRoute } from './parse-route';

const TILE_SIZE = 256;

interface TileWithDistance extends Tile {
  distance: number;
}

type Path = TileWithDistance[];

interface DrawablePoint {
  x: number;
  y: number;
  distance: number;
}

type DrawablePath = DrawablePoint[];

export default async function path({
  zoom,
  input,
  output,
  pageSizeX,
  pageSizeY,
  draw,
  distance,
  distanceStep,
  tileServer,
  tmp,
}: {
  zoom: number;
  input: string;
  output: string;
  pageSizeX: number;
  pageSizeY: number;
  draw: boolean;
  distance: boolean;
  distanceStep: number;
  tileServer: TileServer;
  tmp: string;
}) {
  // collect pages:
  //
  // get route
  const route = await parseRoute(input);
  // convert gps points to tile points
  const tileRoute = getTileRouteWithDistance(route, zoom);
  // convert tile points to pixel points of path
  const drawablePath = getDrawablePath(tileRoute);
  // collect the pages in abstract form
  const pages = collectPages(tileRoute, pageSizeX, pageSizeY);

  // download the tiles and connect them to pages
  await downloadPages(pages, tmp, tileServer);

  // draw path on pages
  if (draw) {
    for (let i = 0, len = pages.length; i < len; ++i) {
      // draw paths
      log(`drawing page ${i + 1}/${pages.length}`);
      const page = pages[i];
      await drawPath(page, drawablePath, distance ? distanceStep : -1, getFilename(tmp, i));
    }
  }

  // make pdf from pages
  await createPdf(output, tmp);
  await clearTmp(tmp);
}

function getDrawablePath(tilePath: Path): DrawablePath {
  const drawablePath: DrawablePath = [];
  // tslint:disable-next-line:no-shadowed-variable
  const path = tilePath.map(point => ({
    x: point.x * TILE_SIZE,
    y: point.y * TILE_SIZE,
  }));

  if (path.length <= 1) {
    path.forEach(point => {
      drawablePath.push({
        x: point.x,
        y: point.y,
        distance: 0,
      });
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
            vector.sum(vector.unit(vector.diff(path[i], path[i - 1])), vector.unit(vector.diff(path[i + 1], path[i]))),
          ),
        );
      }
      const newPoint = vector.sum(point, vector.times(10, direction));
      // don't draw a point if it's too close to the last drawn point
      if (!lastPoint || vector.size(vector.diff(newPoint, lastPoint)) > 30) {
        drawablePath.push({
          x: newPoint.x,
          y: newPoint.y,
          distance: tilePath[i].distance,
        });

        lastPoint = newPoint;
      }

      // make sure the very last point is displayed
      if (i === path.length - 1) {
        // not too close!
        drawablePath.pop();
        drawablePath.push({
          x: newPoint.x,
          y: newPoint.y,
          distance: tilePath[i].distance,
        });
      }
    });
  }

  return drawablePath;
}

async function drawPath(page: Page, drawablePath: DrawablePath, distanceStep: number, filename: string) {
  await new Promise((resolve, reject) => {
    const control = gm(filename);

    // tslint:disable-next-line:no-shadowed-variable
    const path = drawablePath.map(({ x, y, distance }) => ({
      x: x - page.x * TILE_SIZE,
      y: y - page.y * TILE_SIZE,
      distance,
    }));

    // draw points
    control.stroke('red', 2).fill('#000f');
    path.forEach(({ x, y }) => {
      control.drawCircle(x, y, x + 3, y + 3);
    });

    // draw distance labels
    if (distanceStep > -1) {
      control
        .stroke('none')
        .fill('black')
        .font(nodePath.resolve(__dirname, 'fonts/OpenSans/OpenSans-Bold.ttf'), 12);

      let nextDistance = 0;
      // tslint:disable-next-line:no-shadowed-variable
      path.forEach(({ x, y, distance }, i, path) => {
        if (distance >= nextDistance * distanceStep || i === path.length - 1) {
          control.drawText(x + 7, y + 6, distance.toFixed(1));
          ++nextDistance;
        }
      });
    }

    // draw it
    control.write(filename, err => {
      if (err) return reject(err);
      else return resolve();
    });
  });
}

function collectPages(tileRoute: Path, sx: number, sy: number): Page[] {
  const pages: Page[] = [];
  const pageDict: { [id: string]: boolean } = {};

  for (const tile of tileRoute) {
    const pageX = Math.floor(tile.x / sx) * sx;
    const pageY = Math.floor(tile.y / sy) * sy;

    const id = `${pageX}-${pageY}`;
    if (!pageDict[id]) {
      pageDict[id] = true;
      pages.push({
        x: pageX,
        y: pageY,
        sx,
        sy,
        zoom: tile.zoom,
      });
    }
  }

  return pages;
}

function getTileRouteWithDistance(route: Coordinate[], zoom: number): Path {
  const output: Path = [];
  let distance = 0;

  for (let i = 0, len = route.length; i < len; ++i) {
    if (i > 0) {
      distance +=
        (haversine(
          {
            latitude: route[i].lat,
            longitude: route[i].lon,
          },
          {
            latitude: route[i - 1].lat,
            longitude: route[i - 1].lon,
          },
        ) **
          2 +
          (route[i].ele / 1000 - route[i - 1].ele / 1000) ** 2) **
        0.5;
    }
    output.push({
      x: lon2tileExact(route[i].lon, zoom),
      y: lat2tileExact(route[i].lat, zoom),
      zoom,
      distance,
    });
  }
  return output;
}
