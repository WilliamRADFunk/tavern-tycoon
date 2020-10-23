import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Person, PersonDirection, PersonState } from 'src/app/models/person';
import { GridManagerService } from 'src/app/services/grid-manager.service';
import { PersonManagerService } from 'src/app/services/person-manager.service';
import { CalculatePersonNextMove, CalculatePersonsNewDirection, ChangePersonDirection, GetXPos, GetYPos, TURN_DEG } from 'src/app/utils/position-utils';

const PERSON_ACTUAL_SIZE = 36;
const PERSON_IMG_SIZE = 64;
const PERSON_OFFSET = 14;
const WALKING_SPEED = 0.3;

@Component({
  selector: 'tt-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  @Input() columns: number;
  @Input() devMode: boolean;
  @Input() rows: number;

  @ViewChild('p1', { static: true })
  private _patrons: ElementRef<HTMLImageElement>;

  private _animationId: number;

  private _people: Person[] = [
    { // Noble
      animationCounter: 0,
      animationImageLocations: [[0, 128], [64, 128], [128, 128], [0, 192], [64, 192], [128, 192]],
      canvas: null,
      ctx: null,
      currDirection: null,
      currTile: [1, 0],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Bingo Bango',
      position: [GetXPos(0), GetYPos(1)],
      prevState: PersonState.Walking,
      state: PersonState.Walking,
      tileValue: null
    },
    { // Bartender
      animationCounter: 0,
      animationImageLocations: [[0, 0], [64, 0], [128, 0], [0, 64], [64, 64], [128, 64]],
      canvas: null,
      ctx: null,
      currDirection: null,
      currTile: [6, 6],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Douglas Murray',
      position: [GetXPos(6), GetYPos(6)],
      prevState: PersonState.Walking,
      state: PersonState.Walking,
      tileValue: null
    },
    { // Old Man
      animationCounter: 0,
      animationImageLocations: [[0, 256], [64, 256], [128, 256], [0, 320], [64, 320], [128, 320]],
      canvas: null,
      ctx: null,
      currDirection: null,
      currTile: [8, 10],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Jack Diggler',
      position: [GetXPos(10), GetYPos(8)],
      prevState: PersonState.Wandering,
      state: PersonState.Wandering,
      tileValue: null
    }
  ];

  public canvasSize: [number, number] = [64, 64];

  constructor(
    private readonly _elem: ElementRef,
    private readonly _gridManagerService: GridManagerService,
    private readonly _personManagerService: PersonManagerService) {}

  ngOnDestroy() {
    cancelAnimationFrame(this._animationId);
    this._people
      .filter(person => person)
      .forEach(person => person.ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]));
  }

  ngOnInit() {
    this.canvasSize[0] = PERSON_IMG_SIZE;
    this.canvasSize[1] = PERSON_IMG_SIZE;
  }

  ngAfterViewInit() {
    const canvases = this._elem.nativeElement.getElementsByTagName('canvas');
    this._people
      .filter(person => person)
      .forEach((person, index) => {
        person.canvas = canvases[index] as HTMLCanvasElement;
        person.ctx = (person.canvas as HTMLCanvasElement).getContext('2d');
        person.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        this._personManagerService.decideInit(person);
        ChangePersonDirection(person, CalculatePersonsNewDirection(person));
        // Update the tile value.
        this._updateCrewInGrid(person.currTile[0], person.currTile[1], index);
      });

    this._patrons.nativeElement.onload = this._animationCycle.bind(this);
  }

  private _animationCycle() {
    this._people
      .filter(person => !person.isMoving)
      .forEach(person => {
        this._personManagerService.decideFromStandstill(person);
        ChangePersonDirection(person, CalculatePersonsNewDirection(person));
      });
    this._people
      .filter(person => person.isMoving)
      .forEach((person, index) => {
        // Person has arrived at next cell in its path. Update position and shed last tile in path.
        if (person.path.length > 1 && this._hasPersonArrivedAtCell(person)) {
          this._updateCrewInGrid(person.path[0][0], person.path[0][1], -1);
          person.path.shift();
          person.currTile = person.path[0].slice() as [number, number];
          this._updateCrewInGrid(person.path[0][0], person.path[0][1], index);
          const xPos = GetXPos(person.currTile[1]);
          const yPos = GetYPos(person.currTile[0]);
          this._teleportPerson(person, xPos, yPos);

          // Decide to change destination, or keep going.
          this._personManagerService.decideMidstream(person);
          ChangePersonDirection(person, CalculatePersonsNewDirection(person));
        // Still in between tiles, move a little closer to next tile.
        } else {
          const nextMove = CalculatePersonNextMove(person, WALKING_SPEED);
          this._movePerson(person, nextMove[0], nextMove[1]);
          return;
        }

        if (!person.path.length) {
          console.error('This never should have happened!!!', person);
        }

        // Person has arrived at the intended destination. Stop moving.
        if (person.path.length === 1) {
          person.currTile = person.path.shift();
          person.path.shift();
          person.isMoving = false;

          // Decide what to do next.
          this._personManagerService.decideNext(person);
          ChangePersonDirection(person, CalculatePersonsNewDirection(person));
          return;
        }
      });

    // Only redraw the people who are moving.
    const movingPeople = this._people.filter(person => person.isMoving || person.needsUpdate);
    movingPeople.forEach(person => {
        this._animatePerson(person);
        person.needsUpdate = false;
    });

    this._animationId = requestAnimationFrame(this._animationCycle.bind(this));
  }

  private _animatePerson(person: Person): void {
    const imageLocations = person.animationImageLocations;
    let imageLocation;

    const currIndex = person.animationCounter;
    // Middle Posture
    if (currIndex < 10 || (currIndex > 19 && currIndex < 30)) {
      imageLocation = person.currDirection < PersonDirection.Up ? imageLocations[0] : imageLocations[3];
    } else if (currIndex > 29) {
      imageLocation = person.currDirection < PersonDirection.Up ? imageLocations[2] : imageLocations[5];
    } else {
      imageLocation = person.currDirection < PersonDirection.Up ? imageLocations[1] : imageLocations[4];
    }
    person.canvas.style.transform = 'rotate(' + person.currRotation + 'deg)';
    person.canvas.style.left = person.position[0] + 'px';
    person.canvas.style.top = person.position[1] + 'px';
    person.ctx.clearRect(0, 0, PERSON_IMG_SIZE, PERSON_IMG_SIZE);
    person.ctx.drawImage(
      this._patrons.nativeElement,
      imageLocation[0],
      imageLocation[1],
      PERSON_IMG_SIZE,
      PERSON_IMG_SIZE,
      PERSON_OFFSET,
      PERSON_OFFSET,
      PERSON_ACTUAL_SIZE,
      PERSON_ACTUAL_SIZE);

    person.animationCounter++;

    if (person.animationCounter > 39) {
        person.animationCounter = 0;
    }
  }

  /**
   * Checks to see if person is close enough to center of next tile to consider it arrived.
   * @param person person who's position is checked against next tile in its path.
   * @returns whether or not person has arrived at next tile. TRUE has arrived | FALSE has not arrived.
   */
  private _hasPersonArrivedAtCell(person: Person): boolean {
    const currPos = person.position;
    const tileCoords = person.path[1];

    const yDist = GetYPos(tileCoords[0]) - currPos[1];
    const xDist = GetXPos(tileCoords[1]) - currPos[0];

    const dist = Math.sqrt((yDist * yDist) + (xDist * xDist));

    if (dist <= WALKING_SPEED + 0.001) {
        return true;
    }
    return false;
  }

  /**
   *
   * @param person selected individual person of the team to move.
   * @param x amount to move crew person along the x-axis.
   * @param y amount to move crew person along the y-axis.
   */
  private _movePerson(person: Person, x: number, y: number): void {
    person.position[0] += x;
    person.position[1] += y;
  }

  /**
   * Teleports person to provided x and y coord. Differs from movePerson because this isn't incremental.
   * @param person selected individual person of the team to move.
   * @param x coordinate to move person on the x-axis.
   * @param y coordinate to move person on the y-axis.
   */
  private _teleportPerson(person: Person, x: number, y: number): void {
    person.position[0] = x;
    person.position[1] = y;
  }

  /**
   * Updates a grid tile with crew value.
   * @param row row coordinate in the terrain grid
   * @param col col coordinate in the terrain grid
   * @param person person index or person reference with which to update the grid tile value.
   * @returns the value of the tile after changed with person.
   */
  private _updateCrewInGrid(row: number, col: number, person: number | Person): number {
    // If -1 then the person has left the tile, and it needs to be reset.
    if (person === -1 && this._gridManagerService.isInBounds(row, col)) {
      this._gridManagerService.setTileValue(row, col, 3, 0);
      return 0;
    }

    const tileVal: number = Number(person) + 1;
    if (this._gridManagerService.isInBounds(row, col) && (!this._gridManagerService.isBlocking(row, col))) {
      this._gridManagerService.setTileValue(row, col, 3, tileVal);

      return tileVal;
    }

    // Row/Col not in range or blocked.
    return 0;
  }

}
