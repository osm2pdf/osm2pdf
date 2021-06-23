import gm from 'gm';
import log from './log';

export async function createPdf(output: string, tmp: string) {
  log('Creating pdf');
  await new Promise((resolve, reject) => {
    gm(`${tmp}/*.png`).write(`${output}.pdf`, err => {
      if (!err) return resolve();
      if (err) return reject(err);
    });
  });
  // eslint-disable-next-line: no-console
  log(`Your map was saved to ${output}.pdf\n`);
}
