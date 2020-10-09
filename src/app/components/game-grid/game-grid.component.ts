import { Component, Input, OnInit } from '@angular/core';
import { GridManagerService } from 'src/app/services/grid-manager.service';

@Component({
  selector: 'tt-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.scss']
})
export class GameGridComponent implements OnInit {
  @Input() columns: number;
  @Input() rows: number;

  public colset: number[];
  public rowset: number[];

  constructor(private readonly _gridManagerService: GridManagerService) { }

  ngOnInit() {
    this.colset = new Array(this.columns);
    this.rowset = new Array(this.rows);
  }

  public getTileValue(row: number, col: number): number {
    return this._gridManagerService.getTileValue(row, col);
  }

}
