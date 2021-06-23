type GetUrl = (coordinates: { z: number; x: number; y: number }) => string;

export type TileServer = {
  url: GetUrl;
  rateLimit: number;
};

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
