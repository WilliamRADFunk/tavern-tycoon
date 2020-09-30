import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tt-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {
  @Input() devMode: boolean;

  constructor() { }

  ngOnInit() {
  }

}
