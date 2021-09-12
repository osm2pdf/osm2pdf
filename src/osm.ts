/**
 * copied from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
 */

export function lon2tileExact(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

export function lat2tileExact(lat: number, zoom: number): number {
  return (
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  );
}

export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(lon2tileExact(lon, zoom));
}

export function lat2tile(lat: number, zoom: number) {
  return Math.floor(lat2tileExact(lat, zoom));
}

export function tile2lon(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

export function tile2lat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/**
 * Given map edges, count how many tiles does the map consist of
 */
export function getTileSize({
  north,
  west,
  south,
  east,
  zoom,
}: {
  north: number;
  west: number;
  south: number;
  east: number;
  zoom: number;
}): { width: number; height: number } {
  const topTile: number = lat2tile(north, zoom); // eg.lat2tile(34.422, 9);
  const bottomTile: number = lat2tile(south, zoom);
  const leftTile: number = lon2tile(west, zoom);
  const rightTile: number = lon2tile(east, zoom);
  const width: number = Math.abs(leftTile - rightTile) + 1;
  const height: number = Math.abs(topTile - bottomTile) + 1;
  return { width, height };
}
