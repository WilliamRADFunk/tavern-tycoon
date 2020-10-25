import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { gridDictionary, GridDictionaryValue, GridManagerService, TileValues } from 'src/app/services/grid-manager.service';

let imageLoadCount = 0;

@Component({
  selector: 'tt-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {
  @Input() columns: number;
  @Input() devMode: boolean;
  @Input() rows: number;

  @ViewChild('b1', { static: true })
  private _bgMap: ElementRef<HTMLImageElement>;

  @ViewChild('c1', { static: true })
  private _cobble: ElementRef<HTMLImageElement>;

  @ViewChild('bgCanvas', { static: true })
  private _canvas: ElementRef<HTMLCanvasElement>;

  public canvasSize: [number, number] = [64, 64];
  public colset: number[];
  public rowset: number[];

  constructor(private readonly _gridManagerService: GridManagerService) { }

  ngOnInit() {
    this.canvasSize[0] = this.rows * 64;
    this.canvasSize[1] = this.columns * 64;
    this.colset = new Array(this.columns);
    this.rowset = new Array(this.rows);

    this._bgMap.nativeElement.onload = this._buildBackground.bind(this);
    this._cobble.nativeElement.onload = this._buildBackground.bind(this);
  }

  private _buildBackground(): void {
    imageLoadCount++;
    if (imageLoadCount < 2) {
      return;
    }
    const ctx = this._canvas.nativeElement.getContext('2d');
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const tileVal = this._gridManagerService.getTileValue(row, col, 1);
        const spriteVals = (gridDictionary[this._gridManagerService.getTileValue(row, col, 0)] || {} as GridDictionaryValue).spritePosition;
        if (tileVal !== TileValues.Street) {
          ctx.drawImage(
            this._bgMap.nativeElement,
            spriteVals[0],
            spriteVals[1],
            64,
            64,
            (col * 64),
            (row * 64),
            64,
            64);
        } else if (tileVal === TileValues.Street) {
          ctx.drawImage(
            this._cobble.nativeElement,
            0,
            0,
            256,
            256,
            (col * 64),
            (row * 64),
            64,
            64);
        }
      }
    }
  }
}
