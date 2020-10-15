import { Component, OnInit } from '@angular/core';
import { GridManagerService } from './services/grid-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _isScrolling: boolean = false;
  private _pos = { top: 0, left: 0, x: 0, y: 0 };

  public devMode = false;
  public columns = 100;
  public rows = 100;
  public sLeft = 0;
  public sTop = 0;
  public title = 'tavern-tycoon';

  constructor(private readonly _gridManagerService: GridManagerService) {}

  ngOnInit() {
    document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
    this._gridManagerService.initGrid(this.rows, this.columns);
  }

  public mouseDownHandler(e) {
    if (!this._isScrolling) {
      const ele = document.getElementById('main-container');
      // Change the cursor and prevent user from selecting the text
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      this._pos = {
          // The current scroll
          left: this.sLeft,
          top: this.sTop,
          // Get the current mouse position
          x: e.clientX,
          y: e.clientY,
      };

      this._isScrolling = true;

      document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
      document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    }
  }

  public mouseMoveHandler(e): void {
    if (this._isScrolling) {
      // How far the mouse has been moved
      const dx = e.clientX - this._pos.x;
      const dy = e.clientY - this._pos.y;

      // Scroll the element
      this.sTop = this._pos.top - dy;
      this.sLeft = this._pos.left - dx;
    }
  }

  public mouseUpHandler(e) {
    if (this._isScrolling) {
      const ele = document.getElementById('main-container');
      ele.style.cursor = 'grab';
      ele.style.removeProperty('user-select');

      this._isScrolling = false;
    }
  }
}
