import fs from 'fs-extra';
import path from 'path';

export function pad(num: number, decimals = 5): string {
  return ('0'.repeat(decimals) + num).slice(-decimals);
}

export async function clearTmp(tmp: string) {
  await fs.remove(tmp);
}

export const getFilename = (tmp: string, i: number) => path.join(tmp, `${pad(i)}.png`);

export function random<T>(input: T[]): T {
  return input[Math.floor(Math.random() * input.length)];
}

export const wait = (n: number) => new Promise(resolve => setTimeout(resolve, n));

export const fileExists = async (file: string): Promise<boolean> => {
  try {
    await fs.access(file, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};
