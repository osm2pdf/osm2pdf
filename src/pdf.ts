import PDFDocument from 'pdfkit';
import log from './log';
import fs from 'fs-extra';
import { Page } from './types';
import { TILE_SIZE } from './route';

export interface PDFLink {
  x: number;
  y: number;
  width: number;
  height: number;
  url: string | number;
}

export async function createPdf(output: string, pages: Page[], links: PDFLink[][]) {
  log('Creating pdf');
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 0,
      size: [TILE_SIZE * pages[0].sx, TILE_SIZE * pages[0].sy],
      bufferPages: true,
    });
    const stream = doc.pipe(fs.createWriteStream(`${output}.pdf`));
    let first = true;
    for (const page of pages) {
      if (!first) {
        doc.addPage({ margin: 0, size: [TILE_SIZE * page.sx, TILE_SIZE * page.sy] });
      } else {
        first = !first;
      }
      doc.image(page.filename);
    }
    for (let i = 0, len = links.length; i < len; ++i) {
      doc.switchToPage(i);
      for (const link of links[i]) {
        const { x, y, width, height, url } = link;
        doc.link(x, y, width, height, url as string);
      }
    }
    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  log(`Your map was saved to ${output}.pdf\n`);
}
