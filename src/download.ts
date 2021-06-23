import { Page, TileServer, Tile } from './types';
import { getHttp } from './http';
import fs from 'fs-extra';
import mergeImg from 'merge-img';
import log from './log';
import { getFilename } from './utils';

// This is the main exported function. Provide pages, folder and server to dowload from and it fills the tmp folder with the pages
export async function downloadPages(pages: Page[], tmp: string, tileServer: TileServer) {
  await fs.ensureDir(tmp);
  const http = getHttp(tileServer.rateLimit);
  for (let i = 0, len = pages.length; i < len; i++) {
    const page = pages[i];
    log('page', `${i + 1}/${pages.length}`);
    const pageTiles = await getPage(page, { http, tileServer });
    await savePage(pageTiles, getFilename(tmp, i));
  }
}

// download a single tile
async function getTile(
  { x, y, zoom: z }: Tile,
  { http, tileServer }: { http: any; tileServer: TileServer },
): Promise<Buffer> {
  return Buffer.from(
    (
      await http.get(tileServer.url({ z, x, y }), {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'osm2pdf',
        },
      })
    ).data,
    'binary',
  );
}

async function getPage(
  { x, y, sx, sy, zoom }: Page,
  { http, tileServer }: { http: any; tileServer: TileServer },
): Promise<Buffer[][]> {
  const rows: Promise<Buffer[]>[] = [];
  for (let i = 0; i < sx; i++) {
    const row: Promise<Buffer>[] = [];
    for (let j = 0; j < sy; j++) {
      row.push(getTile({ x: x + i, y: y + j, zoom }, { http, tileServer }));
    }
    rows.push(Promise.all(row));
  }
  return await Promise.all(rows);
}

async function mergeTiles(tiles: Buffer[][]): Promise<any> {
  const row = await Promise.all(tiles.map(column => mergeImg(column, { direction: true })));
  return await mergeImg(row);
}

async function savePage(pageTiles: Buffer[][], output: string): Promise<void> {
  const image = await mergeTiles(pageTiles);
  await new Promise(resolve => image.write(output, resolve));
}
