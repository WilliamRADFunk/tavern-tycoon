import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    this.colset = new Array(this.columns);
    this.rowset = new Array(this.rows);
  }

}
