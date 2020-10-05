import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridManagerService {
  private readonly _grid: number[][] = [];

  constructor() { }

  public initGrid(maxRows: number, maxCols: number): void {
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        if (!this._grid[row]) {
          this._grid[row] = [];
        }
        this._grid[row][col] = 0;
      }
    }
  }
}
