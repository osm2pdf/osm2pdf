import { lat2tile, lon2tile, getTileSize } from './osm';
import { TileServer, Page } from './types';
import { createPdf } from './pdf';
import { downloadPages } from './download';
import { clearTmp } from './utils';

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
  // create pdf
  await createPdf(output, tmp);
  // clean up downloaded pages
  await clearTmp(tmp);
}

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
  const x = lon2tile(west, zoom);
  const y = lat2tile(north, zoom);

  const { width, height } = getTileSize({ north, west, south, east, zoom });

  const pagesX = Math.ceil(width / pageSizeX);
  const pagesY = Math.ceil(height / pageSizeY);

  console.log('size', pagesX, 'x', pagesY, 'pages'); // tslint:disable-line:no-console

  const pages: Page[] = [];

  for (let py = 0; py < pagesY; py++) {
    for (let px = 0; px < pagesX; px++) {
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
