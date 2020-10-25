import { Injectable } from '@angular/core';
import { PersonDirection } from '../models/person';

export interface GridDictionaryValue {
  blocker?: boolean;
  customSize?: [number, number];
  description: string;
  hasVariation?: boolean;
  spritePosition: [number, number];
  xPosMod?: number;
  xScaleMod?: number;
  yPosMod?: number;
  yScaleMod?: number;
}

export interface GridDictionary {
  [key: number]: GridDictionaryValue;
}

export enum TileValues {
  'Unknown' = 0,
  'Sidewalk' = 1,
  'Median' = 2,
  'Street' = 3,
  'Door' = 4,
  'Floor' = 5
}

export const gridDictionary: GridDictionary = {
  99: {
    description: 'Other',
    spritePosition: [256, 960]
  },
  100: {
    description: 'Grassy median',
    spritePosition: [64, 1792]
  },
  101: {
    description: 'Sidewalk Horizontal (Top)',
    spritePosition: [64, 1280]
  },
  102: {
    description: 'Sidewalk Horizontal (Bottom)',
    spritePosition: [64, 1408]
  },
  103: {
    description: 'Sidewalk Vertical (Left)',
    spritePosition: [1, 1]
  },
  104: {
    description: 'Sidewalk Vertical (Right)',
    spritePosition: [1, 1]
  },
  105: {
    description: 'Street Cobblestone',
    spritePosition: [0, 0]
  },
  106: {
    description: 'Door',
    spritePosition: [0, 1344]
  },
  107: {
    description: 'Floor Wooden',
    spritePosition: [64, 1344]
  },
};

// 0: the tile graphic to use in the background.
// 1: the type of tile (path-finding).
// 2: whether tile is blocked.
// 3: nature of tile (ie. in front of a door to enter).

@Injectable({
  providedIn: 'root'
})
export class GridManagerService {
  private maxCols: number;
  private maxRows: number;
  private minCols: number = 0;
  private minRows: number = 0;
  private readonly _grid: [number, TileValues, number, number, number][][] = [];

  constructor() { }

  public initGrid(maxRows: number, maxCols: number): void {
    this.maxCols = maxCols;
    this.maxRows = maxRows;
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        if (!this._grid[row]) {
          this._grid[row] = [];
        }
        if (!this._grid[row][col]) {
          this._grid[row][col] = [99, TileValues.Unknown, 1, 0, 0];
        }
      }
    }
    for (let col = 0; col < maxCols; col++) {
      this._grid[1][col][0] = 101;
      this._grid[1][col][1] = TileValues.Sidewalk;
      this._grid[1][col][2] = 0;

      this._grid[2][col][0] = 100;
      this._grid[2][col][1] = TileValues.Median;
      this._grid[2][col][2] = 0;

      this._grid[3][col][0] = 105;
      this._grid[3][col][1] = TileValues.Street;
      this._grid[3][col][2] = 0;

      this._grid[4][col][0] = 105;
      this._grid[4][col][1] = TileValues.Street;
      this._grid[4][col][2] = 0;

      this._grid[5][col][0] = 100;
      this._grid[5][col][1] = TileValues.Median;
      this._grid[5][col][2] = 0;

      this._grid[6][col][0] = 102;
      this._grid[6][col][1] = TileValues.Sidewalk;
      this._grid[6][col][2] = 0;
    }
    for (let row = 8; row < 12; row++) {
      for (let col = 5; col < 15; col++) {
        this._grid[row][col][0] = 107;
        this._grid[row][col][1] = TileValues.Floor;
        this._grid[row][col][2] = 0;
      }
    }
    this._grid[7][9][0] = 106;
    this._grid[7][9][1] = TileValues.Door;
    this._grid[7][9][2] = 0;

    // Trigger Tile
    this._grid[6][9][3] = PersonDirection.Down;
  }

  public getTileValue(row: number, col: number, vLayer: number): number {
    if (!this.isInBounds(row, col)) {
      console.error('getTileValue', 'Out of bounds', row, col);
    }
    return this._grid[row][col][vLayer];
  }

  /**
   * Checks to see if the tile in question can be travelled to or across.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @returns TRUE if that tile is a blocking tile | FALSE if it is not blocking
   */
  public isBlocking(row: number, col: number): boolean {
    return !!this._grid[row][col][2];
  }

  /**
   * Checks out of bound scenarios for the tile grid.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @returns TRUE is in grid range | FALSE not in grid range
   */
  public isInBounds(row: number, col: number): boolean {
    if (row < this.minRows || row >= this.maxRows) {
        return false;
    } else if (col < this.minCols || col >= this.maxCols) {
        return false;
    }
    return true;
  }

  public setTileValue(row: number, col: number, vLayer: number, val: number): void {
    setTimeout(() => {
      this._grid[row][col][vLayer] = val;
    }, 0);
  }
}
