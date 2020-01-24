import axios from 'axios';
import mergeImg from 'merge-img';
import gm from 'gm';
import fs from 'fs-extra';
import { pad } from './utils';
import log from './log';

export interface Tile {
  x: number;
  y: number;
  zoom: number;
}

export interface PageSize {
  sx: number;
  sy: number;
}

export interface Page extends Tile, PageSize {}

async function getTile({ x, y, zoom }: Tile): Promise<Buffer> {
  return Buffer.from(
    (
      await axios.get(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, {
        responseType: 'arraybuffer',
      })
    ).data,
    'binary',
  );
}

export async function getPage({ x, y, sx, sy, zoom }: Page): Promise<Buffer[][]> {
  const rows: Promise<Buffer[]>[] = [];
  for (let i = 0; i < sx; i++) {
    const row: Promise<Buffer>[] = [];
    for (let j = 0; j < sy; j++) {
      row.push(getTile({ x: x + i, y: y + j, zoom }));
    }
    rows.push(Promise.all(row));
  }
  return await Promise.all(rows);
}

async function mergeTiles(tiles: Buffer[][]): Promise<any> {
  const row = await Promise.all(tiles.map(column => mergeImg(column, { direction: true })));
  return await mergeImg(row);
}

async function createPdf(name: string, tmp: string) {
  await new Promise((resolve, reject) => {
    gm(`${tmp}/*.png`).write(`${name}.pdf`, err => {
      if (!err) return resolve();
      if (err) return reject(err);
    });
  });
}

async function clearTemporary(tmp: string) {
  await fs.remove(tmp);
}

export async function pages2pdf(pages: Page[], name: string): Promise<void> {
  const tmp = `tmp${Date.now()}`;
  await fs.ensureDir(tmp);

  for (let i = 0, len = pages.length; i < len; i++) {
    const page = pages[i];
    log('page', `${i + 1}/${pages.length}`);
    const pageTiles = await getPage(page);
    const image = await mergeTiles(pageTiles);

    await new Promise(resolve => image.write(`${tmp}/${pad(i)}.png`, resolve));
  }

  await createPdf(name, tmp);
  await clearTemporary(tmp);

  log();
  console.log(`Finished! Your map was saved to ${name}.pdf`); // tslint:disable-line:no-console
}
