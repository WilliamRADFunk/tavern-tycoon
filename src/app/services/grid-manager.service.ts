import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridManagerService {
  private maxCols: number;
  private maxRows: number;
  private minCols: number = 0;
  private minRows: number = 0;
  private readonly _grid: number[][] = [];

  constructor() { }

  public initGrid(maxRows: number, maxCols: number): void {
    this.maxCols = maxCols;
    this.maxRows = maxRows;
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        if (!this._grid[row]) {
          this._grid[row] = [];
        }
        this._grid[row][col] = 0;
      }
    }
  }

  public getTileValue(row: number, col: number): number {
    return this._grid[row][col];
  }

  /**
   * Checks to see if the tile in question can be travelled to or across.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @returns TRUE if that tile is a blocking tile | FALSE if it is not blocking
   */
  public isBlocking(row: number, col: number): boolean {
    return !!this._grid[row][col];
  }

  /**
   * Checks out of bound scenarios for the tile grid.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @returns TRUE is in grid range | FALSE not in grid range
   */
  public isInBounds(row: number, col: number): boolean {
    if (row < this.minRows || row > this.maxRows) {
        return false;
    } else if (col < this.minCols || col > this.maxCols) {
        return false;
    // Makes sure nothing can be populated behind the control panel.
    } else if (row === this.minRows && col > this.maxCols - 4) {
        return false;
    }
    return true;
  }

  public setTileValue(row: number, col: number, val: number): void {
    setTimeout(() => {
      this._grid[row][col] = val;
    }, 0);
  }
}
