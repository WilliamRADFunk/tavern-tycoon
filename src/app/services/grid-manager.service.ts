import { Injectable } from '@angular/core';

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

const gridDictionary: GridDictionary = {
  100: {
      blocker: false,
      description: 'Lush green grass',
      spritePosition: [1, 1],
      hasVariation: false
    },
};

@Injectable({
  providedIn: 'root'
})
export class GridManagerService {
  private maxCols: number;
  private maxRows: number;
  private minCols: number = 0;
  private minRows: number = 0;
  private readonly _grid: number[][][] = [];

  constructor() { }

  public initGrid(maxRows: number, maxCols: number): void {
    this.maxCols = maxCols;
    this.maxRows = maxRows;
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        if (!this._grid[row]) {
          this._grid[row] = [];
        }
        if (row >= 1 && row <= 6) {
          this._grid[row][col] = [0, 0, 0, 0];
        } else {
          this._grid[row][col] = [0, 1, 0, 0];
        }
      }
    }
  }

  public getTileValue(row: number, col: number, vLayer: number): number {
    return this._grid[row][col][vLayer];
  }

  /**
   * Checks to see if the tile in question can be travelled to or across.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @returns TRUE if that tile is a blocking tile | FALSE if it is not blocking
   */
  public isBlocking(row: number, col: number): boolean {
    return !!this._grid[row][col][1];
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
