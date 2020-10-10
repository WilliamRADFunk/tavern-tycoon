import { Component, Input, OnInit } from '@angular/core';
import { GridManagerService } from 'src/app/services/grid-manager.service';

@Component({
  selector: 'tt-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {
  @Input() columns: number;
  @Input() devMode: boolean;
  @Input() rows: number;

  public canvasSize: [number, number] = [64, 64];
  public colset: number[];
  public rowset: number[];

  constructor(private readonly _gridManagerService: GridManagerService) { }

  ngOnInit() {
    this.canvasSize[0] = this.rows * 64;
    this.canvasSize[1] = this.columns * 64;
    this.colset = new Array(this.columns);
    this.rowset = new Array(this.rows);
  }

}
