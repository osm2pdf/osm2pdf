import { lat2tile, lon2tile, getTileSize, lat2tileExact, lon2tileExact, tile2lat, tile2lon } from './osm';
import { Page, TileServer } from './types';
import { createPdf, PDFLink } from './pdf';
import { downloadPages } from './download';
import { clearTmp, getFilename } from './utils';
import { TILE_SIZE } from './route';
import { MapConfig } from './config';
import gm from 'gm';
import log from './log';
import path from 'path';

// main executable function
export default async function map(config: MapConfig) {
  const { output, tmp } = config;
  // collect content
  const contentPage = getContentPage(config);

  const pages: Page[] = boundaries2pages(config);
  const links = boundaries2links(config, contentPage ? 1 : 0);

  if (contentPage) {
    const contentLinks = getContentLinks(contentPage, pages);
    links.unshift(contentLinks);
    pages.unshift(contentPage);
  }

  // download pages
  await downloadPages(pages, tmp);
  // draw boundary
  await drawBoundary(pages, config);
  // create pdf
  await createPdf(output, pages, links);
  // clean up downloaded pages
  await clearTmp(tmp);
}

const getContentLinks = (contentPage: Page, pages: Page[]): PDFLink[] => {
  const links: PDFLink[] = [];

  let i = 1;
  pages.forEach(page => {
    const lon = tile2lon(page.x, page.zoom);
    const lat = tile2lat(page.y, page.zoom);
    const lon2 = tile2lon(page.x + page.sx, page.zoom);
    const lat2 = tile2lat(page.y + page.sy, page.zoom);
    links.push({
      x: (lon2tileExact(lon, contentPage.zoom) - contentPage.x) * TILE_SIZE,
      y: (lat2tileExact(lat, contentPage.zoom) - contentPage.y) * TILE_SIZE,
      width: (lon2tileExact(lon2, contentPage.zoom) - lon2tileExact(lon, contentPage.zoom)) * TILE_SIZE,
      height: (lat2tileExact(lat2, contentPage.zoom) - lat2tileExact(lat, contentPage.zoom)) * TILE_SIZE,
      url: i++,
    });
  });

  return links;
};

const getContentPage = ({
  north,
  west,
  south,
  east,
  pageSizeX,
  pageSizeY,
  zoom,
  tmp,
  tileServer,
}: MapConfig): Page | undefined => {
  for (; zoom > 0; zoom--) {
    const { width, height } = getTileSize({ north, west, south, east, zoom });
    if (width <= pageSizeX && height <= pageSizeY)
      return {
        x: lon2tile(west, zoom) - Math.floor((pageSizeX - width) / 2),
        y: lat2tile(north, zoom) - Math.floor((pageSizeY - height) / 2),
        zoom,
        sx: pageSizeX,
        sy: pageSizeY,
        tileServer,
        filename: path.join(tmp, 'content.png'),
      };
  }
};

const drawBoundary = async (
  pages: Page[],
  { north, west, south, east }: Pick<MapConfig, 'north' | 'west' | 'south' | 'east'>,
): Promise<void> => {
  for (let i = 0, len = pages.length; i < len; ++i) {
    log(`drawing boundary ${i + 1}/${len}`);
    const page = pages[i];

    const tileBoundary = {
      north: lat2tileExact(north, page.zoom),
      south: lat2tileExact(south, page.zoom),
      east: lon2tileExact(east, page.zoom),
      west: lon2tileExact(west, page.zoom),
    };

    const control = gm(page.filename);

    const pixelBoundary = {
      north: (tileBoundary.north - page.y) * TILE_SIZE,
      south: (tileBoundary.south - page.y) * TILE_SIZE,
      east: (tileBoundary.east - page.x) * TILE_SIZE,
      west: (tileBoundary.west - page.x) * TILE_SIZE,
    };

    // draw boundary
    const maxWidth = Math.max(page.sx, page.sy) * TILE_SIZE;
    control.stroke('#000a', maxWidth).fill('#000f');
    control.drawRectangle(
      pixelBoundary.west - maxWidth / 2,
      pixelBoundary.north - maxWidth / 2,
      pixelBoundary.east + maxWidth / 2,
      pixelBoundary.south + maxWidth / 2,
    );

    await new Promise<void>((resolve, reject) => {
      // draw it
      control.write(page.filename, err => {
        if (err) return reject(err);
        else return resolve();
      });
    });
  }
};

const boundaries2links = (
  {
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
  },
  offset: number,
): PDFLink[][] => {
  const { width, height } = boundaries2size({ north, west, south, east, pageSizeX, pageSizeY, zoom });

  const links: PDFLink[][] = [];
  const pageSize = { width: pageSizeX * TILE_SIZE, height: pageSizeY * TILE_SIZE };
  const breakPoints = {
    x: [0, 0.25 * pageSize.width, 0.75 * pageSize.width, pageSize.width],
    y: [0, 0.25 * pageSize.height, 0.75 * pageSize.height, pageSize.height],
  };
  for (let i = 0, len = width * height; i < len; ++i) {
    const linksForPage: PDFLink[] = [];
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
          linksForPage.push({ x, y, width: w, height: h, url: url + offset });
        }
      }
    }
    links.push(linksForPage);
  }
  return links;
};

// given gps boundaries, return size of the map in pages
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
  tileServer,
  tmp,
}: {
  north: number;
  west: number;
  south: number;
  east: number;
  pageSizeX: number;
  pageSizeY: number;
  zoom: number;
  tileServer: TileServer;
  tmp: string;
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
        filename: getFilename(tmp, px + py * width),
        tileServer,
      });
    }
  }

  return pages;
}
