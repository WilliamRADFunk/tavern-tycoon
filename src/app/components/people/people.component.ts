import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'tt-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  @Input() columns: number;
  @Input() rows: number;

  @ViewChild('canvas', { static: true }) 
  private _canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('p1', { static: true }) 
  private _people1: ElementRef<HTMLImageElement>;

  private _animationId: number;
  private _ctx: CanvasRenderingContext2D;
  private _frameCounter: number = 0;
  private _people1Frame: number = 0;

  public canvasSize: [number, number] = [64, 64];

  constructor() {}

  ngOnDestroy() {
    cancelAnimationFrame(this._animationId);
    this._ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
  }

  ngOnInit() {
    this.canvasSize[0] = this.columns * 64;
    this.canvasSize[1] = this.rows * 64;
    this._ctx = this._canvas.nativeElement.getContext('2d');
    this._people1.nativeElement.onload = this._animate.bind(this);
  }

  private _animate() {
    this._frameCounter++;
    if (this._frameCounter > 63999) {
      this._frameCounter = 0;
    }

    if (this._frameCounter % 20 === 0) {
      this._people1Frame++;
      if (this._people1Frame > 3) {
        this._people1Frame = 0;
      }
      let x;
      switch(this._people1Frame) {
        case 0: {
          x = 0;
          break;
        }
        case 1: {
          x = 64;
          break;
        }
        case 2: {
          x = 0;
          break;
        }
        case 3: {
          x = 128;
          break;
        }
      }
      this._ctx.clearRect(8, 8, 48, 48);
      this._ctx.drawImage(this._people1.nativeElement, x, 0, 64, 64, 8, 8, 48, 48);
    }
    this._animationId = requestAnimationFrame(this._animate.bind(this));
  }

}
