import { lat2tile, lon2tile, getTileSize } from './osm';
import { pages2pdf, Page, PageSize } from './pdf';

interface Boundaries {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

// main executable function
export default async function map(boundaries: Boundaries, pageSize: PageSize, output: string) {
  const pages: Page[] = boundaries2pages(boundaries, pageSize);

  await pages2pdf(pages, output);
}

function boundaries2pages({ north, west, south, east, zoom }: Boundaries, { sx, sy }: PageSize) {
  const x = lon2tile(west, zoom);
  const y = lat2tile(north, zoom);

  const { width, height } = getTileSize({ north, west, south, east, zoom });

  const pagesX = Math.ceil(width / sx);
  const pagesY = Math.ceil(height / sy);

  console.log('size', pagesX, 'x', pagesY, 'pages'); // tslint:disable-line:no-console

  const pages: Page[] = [];

  for (let py = 0; py < pagesY; py++) {
    for (let px = 0; px < pagesX; px++) {
      pages.push({
        x: x + px * sx,
        y: y + py * sy,
        sx,
        sy,
        zoom,
      });
    }
  }

  return pages;
}
