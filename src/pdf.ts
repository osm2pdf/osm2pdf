import PDFDocument from 'pdfkit';
import log from './log';
import fs from 'fs-extra';
import path from 'path';

export interface PDFOptions {
  pageSizeX: number;
  pageSizeY: number;
  links: {
    x: number;
    y: number;
    width: number;
    height: number;
    url: string | number;
  }[][];
}

export async function createPdf(output: string, tmp: string, { pageSizeX, pageSizeY, links }: PDFOptions) {
  log('Creating pdf');
  const files = await fs.readdir(tmp);
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: [256 * pageSizeX, 256 * pageSizeY], bufferPages: true });
    const stream = doc.pipe(fs.createWriteStream(`${output}.pdf`));
    let first = true;
    for (const file of files) {
      if (!first) {
        doc.addPage();
      } else {
        first = !first;
      }
      doc.image(path.join(tmp, file));
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
  // eslint-disable-next-line: no-console
  log(`Your map was saved to ${output}.pdf\n`);
}
