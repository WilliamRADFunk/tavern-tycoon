import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('b1', { static: true })
  private _bgMap: ElementRef<HTMLImageElement>;

  // @ViewChild('c1', { static: true })
  // private _cobble: ElementRef<HTMLImageElement>;

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
  }

  private _buildBackground(): void {
    const ctx = this._canvas.nativeElement.getContext('2d');
    for (let col = 0; col < this.columns; col++) {
      ctx.drawImage(
        this._bgMap.nativeElement,
        64,
        1792,
        64,
        64,
        (col * 64),
        128,
        64,
        64);
      
      ctx.drawImage(
        this._bgMap.nativeElement,
        64,
        1792,
        64,
        64,
        (col * 64),
        320,
        64,
        64);
      
      // ctx.drawImage(
      //   this._cobble.nativeElement,
      //   0,
      //   0,
      //   64,
      //   64,
      //   (col * 64),
      //   256,
      //   64,
      //   64);
    }
  }

}
