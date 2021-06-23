import xml2js from 'xml2js';
import fs from 'fs-extra';
import { promisify } from 'util';

const parseString = promisify(xml2js.parseString);

export interface Coordinate {
  lat: number;
  lon: number;
  ele: number;
}

interface StringCoordinate {
  lat: string;
  lon: string;
}

interface Route {
  gpx: {
    trk: {
      trkseg: {
        trkpt: {
          $: StringCoordinate;
          ele: string[];
        }[];
      }[];
    }[];
  };
}

export async function parseRoute(file: string): Promise<Coordinate[]> {
  const xml = (await fs.readFile(file)).toString();
  const raw = (await parseString(xml)) as Route;
  return raw.gpx.trk[0].trkseg[0].trkpt.map(({ $: { lat, lon }, ele: [ele] }) => ({ lat: +lat, lon: +lon, ele: +ele }));
}
