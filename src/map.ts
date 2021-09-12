import { lat2tile, lon2tile, getTileSize, lat2tileExact, lon2tileExact } from './osm';
import { TileServer, Page } from './types';
import { createPdf, PDFOptions } from './pdf';
import { downloadPages } from './download';
import { clearTmp, getFilename } from './utils';
import { TILE_SIZE } from './route';
import { MapConfig } from './config';
import gm from 'gm';
import log from './log';

// main executable function
export default async function map({
  zoom,
  output,
  pageSizeX,
  pageSizeY,
  north,
  west,
  south,
  east,
  tileServer,
  tmp,
}: {
  zoom: number;
  output: string;
  pageSizeX: number;
  pageSizeY: number;
  north: number;
  west: number;
  south: number;
  east: number;
  tileServer: TileServer;
  tmp: string;
}) {
  // collect pages
  const pages: Page[] = boundaries2pages({ north, west, south, east, pageSizeX, pageSizeY, zoom });
  // download pages
  await downloadPages(pages, tmp, tileServer);
  // draw boundary
  await drawBoundary(pages, { north, west, south, east, zoom, tmp, pageSizeX, pageSizeY });
  // create pdf
  await createPdf(output, tmp, {
    pageSizeX,
    pageSizeY,
    links: boundaries2links({ north, west, south, east, pageSizeX, pageSizeY, zoom }),
  });
  // clean up downloaded pages
  await clearTmp(tmp);
}

const drawBoundary = async (
  pages: Page[],
  {
    north,
    west,
    south,
    east,
    zoom,
    tmp,
    pageSizeX,
    pageSizeY,
  }: Pick<MapConfig, 'north' | 'west' | 'south' | 'east' | 'zoom' | 'tmp' | 'pageSizeX' | 'pageSizeY'>,
): Promise<void> => {
  const tileBoundary = {
    north: lat2tileExact(north, zoom),
    south: lat2tileExact(south, zoom),
    east: lon2tileExact(east, zoom),
    west: lon2tileExact(west, zoom),
  };

  for (let i = 0, len = pages.length; i < len; ++i) {
    log(`drawing boundary ${i + 1}/${len}`);
    const page = pages[i];
    const filename = getFilename(tmp, i);
    const control = gm(filename);

    const pixelBoundary = {
      north: (tileBoundary.north - page.y) * TILE_SIZE,
      south: (tileBoundary.south - page.y) * TILE_SIZE,
      east: (tileBoundary.east - page.x) * TILE_SIZE,
      west: (tileBoundary.west - page.x) * TILE_SIZE,
    };

    // draw boundary
    const maxWidth = Math.max(pageSizeX, pageSizeY) * TILE_SIZE;
    control.stroke('#000a', maxWidth).fill('#000f');
    control.drawRectangle(
      pixelBoundary.west - maxWidth / 2,
      pixelBoundary.north - maxWidth / 2,
      pixelBoundary.east + maxWidth / 2,
      pixelBoundary.south + maxWidth / 2,
    );

    await new Promise<void>((resolve, reject) => {
      // draw it
      control.write(filename, err => {
        if (err) return reject(err);
        else return resolve();
      });
    });
  }
};

const boundaries2links = ({
  north,
  west,
  south,
  east,
  pageSizeX,
  pageSizeY,
  zoom,
}: {
  north: number;
  west: number;
  south: number;
  east: number;
  pageSizeX: number;
  pageSizeY: number;
  zoom: number;
}): PDFOptions['links'] => {
  const { width, height } = boundaries2size({ north, west, south, east, pageSizeX, pageSizeY, zoom });

  const links: PDFOptions['links'] = [];
  const pageSize = { width: pageSizeX * TILE_SIZE, height: pageSizeY * TILE_SIZE };
  const breakPoints = {
    x: [0, 0.25 * pageSize.width, 0.75 * pageSize.width, pageSize.width],
    y: [0, 0.25 * pageSize.height, 0.75 * pageSize.height, pageSize.height],
  };
  for (let i = 0, len = width * height; i < len; ++i) {
    const linksForPage: PDFOptions['links'][number] = [];
    for (const yi of [-1, 0, 1]) {
      for (const xi of [-1, 0, 1]) {
        const url = i + yi * width + xi;
        const x = breakPoints.x[xi + 1];
        const y = breakPoints.y[yi + 1];
        const w = breakPoints.x[xi + 2] - breakPoints.x[xi + 1];
        const h = breakPoints.y[yi + 2] - breakPoints.y[yi + 1];
        if (
          url >= 0 &&
          url < len &&
          // we don't want to link to page itself
          url !== i &&
          // we don't want to go beyond left and right edges
          url % width === (i % width) + xi &&
          // we don't want to go beyond top and bottom edges
          Math.floor(url / width) % height === (Math.floor(i / width) % height) + yi
        ) {
          linksForPage.push({ x, y, width: w, height: h, url });
        }
      }
    }
    links.push(linksForPage);
  }
  return links;
};

const boundaries2size = ({
  north,
  west,
  south,
  east,
  pageSizeX,
  pageSizeY,
  zoom,
}: {
  north: number;
  west: number;
  south: number;
  east: number;
  pageSizeX: number;
  pageSizeY: number;
  zoom: number;
}): { width: number; height: number } => {
  const { width, height } = getTileSize({ north, west, south, east, zoom });
  return {
    width: Math.ceil(width / pageSizeX),
    height: Math.ceil(height / pageSizeY),
  };
};

function boundaries2pages({
  north,
  west,
  south,
  east,
  pageSizeX,
  pageSizeY,
  zoom,
}: {
  north: number;
  west: number;
  south: number;
  east: number;
  pageSizeX: number;
  pageSizeY: number;
  zoom: number;
}) {
  const { width, height } = boundaries2size({ north, west, south, east, zoom, pageSizeX, pageSizeY });

  console.log('size', width, 'x', height, 'pages'); // tslint:disable-line:no-console

  const pages: Page[] = [];

  const x = lon2tile(west, zoom);
  const y = lat2tile(north, zoom);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      pages.push({
        x: x + px * pageSizeX,
        y: y + py * pageSizeY,
        sx: pageSizeX,
        sy: pageSizeY,
        zoom,
      });
    }
  }

  return pages;
}
