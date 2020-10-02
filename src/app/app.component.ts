import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _isScrolling: boolean = false;
  private _pos = { top: 0, left: 0, x: 0, y: 0 };

  public devMode = true;
  public columns = 100;
  public rows = 100;
  public title = 'tavern-tycoon';

  constructor() {}

  ngOnInit() {
    document.addEventListener('mousedown', this.mouseDownHandler.bind(this));
  }

  public mouseDownHandler(e) {
    if (!this._isScrolling) {
      const ele = document.getElementById('main-container');
      // Change the cursor and prevent user from selecting the text
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      this._pos = {
          // The current scroll 
          left: ele.scrollLeft,
          top: ele.scrollTop,
          // Get the current mouse position
          x: e.clientX,
          y: e.clientY,
      };

      console.log('mouseDownHandler', ele.scrollTop, ele.scrollLeft, this._pos);

      this._isScrolling = true;

      document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
      document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    }
  }

  public mouseMoveHandler(e): void {
    if (this._isScrolling) {
      const ele = document.getElementById('main-container');
      // How far the mouse has been moved
      const dx = e.clientX - this._pos.x;
      const dy = e.clientY - this._pos.y;

      console.log('mouseMoveHandler: before', e.clientX, e.clientY, ele.scrollLeft, ele.scrollTop, dx, dy, this._pos.x, this._pos.y);

      // Scroll the element
      ele.scrollTop = Math.ceil(this._pos.top - dy);
      ele.scrollLeft = this._pos.left - dx;

      this._pos.left = ele.scrollLeft;
      this._pos.top = ele.scrollTop;

      console.log('mouseMoveHandler: after', e.clientX, e.clientY, ele.scrollLeft, ele.scrollTop, dx, dy, this._pos.x, this._pos.y);
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
