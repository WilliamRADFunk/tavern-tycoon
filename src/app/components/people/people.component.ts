import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridManagerService, TileValues } from 'src/app/services/grid-manager.service';

const adjacencyMods: [number, number][] = [ [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];
const fourSidesMods: [number, number][] = [ [1, 0], [0, 1], [-1, 0], [0, -1] ];
let pathFindMemo: { [key: number]: number } = {};

const RAD_90_DEG_LEFT = 90;
const RAD_45_DEG_LEFT = 45;
const RAD_180_DEG_LEFT = 180;
const RAD_135_DEG_LEFT = 135;
const RAD_225_DEG_LEFT = 225;
const RAD_270_DEG_LEFT = 270;
const RAD_315_DEG_LEFT = 315;

const PERSON_ACTUAL_SIZE = 36;
const PERSON_IMG_SIZE = 64;
const PERSON_OFFSET = 14;
const walkingSpeed = 0.3;

const getXPos: (col: number) => number = (col) => {
  return (col * 64);
};
const getYPos: (row: number) => number = (row) => {
  return (row * 64);
};

enum PersonDirection {
  'Down' = 0,
  'Down_Left' = 1,
  'Left' = 2,
  'Right' = 3,
  'Down_Right' = 4,
  'Up' = 5,
  'Up_Left' = 6,
  'Up_Right' = 7,
}

enum PersonState {
  'Crossing_Street' = 0,
  'Idle' = 1,
  'Start_Walking' = 2,
  'Walking' = 3,
  'Wandering' = 4
}

/**
 * Essential information that each person must have to fascilitate the functioning in the game.
 */
interface Person {
  /**
   * Tracks position in walking animation sequence to know which animation to switch to next frame.
   */
  animationCounter: number;

  /**
   * The three meshes to flip through to simulate a walking animation.
   */
  animationImageLocations: [number, number][];

  /**
   * Canvas reference belonging to this person.
   */
  canvas: HTMLCanvasElement;

  /**
   * Context belonging to this person.
   */
  ctx: CanvasRenderingContext2D;

  /**
   * Current direction person should be facing.
   */
  currDirection: PersonDirection;

  /**
   * Current tile person is in.
   */
  currTile: [number, number];

  /**
   * Current rotation applied to person.
   */
  currRotation: number;

  /**
   * Tiles in order that make up the person's path to travel.
   * Row, Column coordinates for each tile.
   */
  path: [number, number][];

  /**
   * Flag to signal walking animation should be active.
   */
  isMoving?: boolean;

  /**
   * Person's name. ie. John Doe.
   */
  name: string;

  /**
   * Row, Column tile position of the person.
   */
  position: [number, number];

  /**
   * State of the person.
   */
  state: PersonState;

  /**
   * Value to place on tile's level layer when person is occupying it.
   */
  tileValue: number;
}

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
    {
      animationCounter: 0,
      animationImageLocations: [[0, 0], [64, 0], [128, 0], [0, 64], [64, 64], [128, 64]],
      canvas: null,
      ctx: null,
      currDirection: PersonDirection.Down,
      currTile: [1, 0],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Bingo Bango',
      position: [getXPos(0), getYPos(1)],
      state: PersonState.Crossing_Street,
      tileValue: null
    },
    {
      animationCounter: 0,
      animationImageLocations: [[192, 128], [256, 128], [320, 128], [192, 128], [256, 128], [320, 128]],
      canvas: null,
      ctx: null,
      currDirection: PersonDirection.Right,
      currTile: [6, 6],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Douglas Murray',
      position: [getXPos(6), getYPos(6)],
      state: PersonState.Walking,
      tileValue: null
    },
    {
      animationCounter: 0,
      animationImageLocations: [[0, 384], [64, 384], [128, 384], [0, 384], [64, 384], [128, 384]],
      canvas: null,
      ctx: null,
      currDirection: PersonDirection.Up,
      currTile: [3, 9],
      currRotation: 0,
      isMoving: false,
      path: [],
      name: 'Jack Diggler',
      position: [getXPos(9), getYPos(3)],
      state: PersonState.Wandering,
      tileValue: null
    }
  ];

  public canvasSize: [number, number] = [64, 64];

  constructor(
    private readonly _elem: ElementRef,
    private readonly _gridManagerService: GridManagerService) {}

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
        person.path = this._getShortestPath(person.currTile[0], person.currTile[1], person.currTile[0], person.currTile[1] + 2);
        person.isMoving = true;
        this._changePersonDirection(index, this._calculatePersonsNewDirection(person));
        // Update the tile value.
        this._updateCrewInGrid(person.currTile[0], person.currTile[1], index);
      });

    this._patrons.nativeElement.onload = this._animationCycle.bind(this);
  }

  /**
   * Based on the difference in row and column of current person tile and their next, this finds new person direction.
   * @param Person whose new direction is to be calculated.
   * @returns the new direction the person should be facing.
   */
  private _calculatePersonsNewDirection(person: Person): PersonDirection {
    const verticalDifference = person.path[1][0] - person.currTile[0];
    const horizontalDifference = person.path[1][1] - person.currTile[1];
    // vertical difference * 10 + horrizontal difference = unique number for each of 8 possible directions without all the if-elses.
    const dirCode = (verticalDifference * 10) + horizontalDifference;
    switch (dirCode) {
      case 10: {
          return PersonDirection.Down;
      }
      case 11: {
          return PersonDirection.Down_Right;
      }
      case 1: {
          return PersonDirection.Right;
      }
      case -9: {
          return PersonDirection.Up_Right;
      }
      case -10: {
          return PersonDirection.Up;
      }
      case -11: {
          return PersonDirection.Up_Left;
      }
      case -1: {
          return PersonDirection.Left;
      }
      case 9: {
          return PersonDirection.Down_Left;
      }
      default: {
          console.error('calculatePersonsNewDirection: Impossible dirrection key', dirCode, verticalDifference, horizontalDifference);
      }
    }
  }

  private _rotatePerson(oldRotation: number, person: Person): void {
    person.currRotation = -oldRotation;
    let rotApplied = 0;
    switch (person.currDirection) {
      case PersonDirection.Down: {
        rotApplied += 0;
        break;
      }
      case PersonDirection.Down_Left: {
        rotApplied += 0;//RAD_45_DEG_LEFT;
        break;
      }
      case PersonDirection.Left: {
        rotApplied += RAD_90_DEG_LEFT;
        break;
      }
      case PersonDirection.Up_Left: {
        rotApplied += 0;//RAD_135_DEG_LEFT;
        break;
      }
      case PersonDirection.Up: {
        rotApplied += 0;//RAD_180_DEG_LEFT;
        break;
      }
      case PersonDirection.Up_Right: {
        rotApplied += 0;//RAD_225_DEG_LEFT;
        break;
      }
      case PersonDirection.Right: {
        rotApplied += RAD_270_DEG_LEFT;
        break;
      }
      case PersonDirection.Down_Right: {
        rotApplied += 0;//RAD_315_DEG_LEFT;
        break;
      }
      default: {
        console.error('_rotatePerson', 'Received an invalid direction');
      }
    }

    person.currRotation = rotApplied;
  }

  private _animationCycle() {
    this._people
      .filter(person => !person.isMoving)
      .forEach((person, index) => {
        if (person.path[1] && !this._gridManagerService.isBlocking(person.path[1][0], person.path[1][1])) {
          person.isMoving = true;
        } else if (person.state === PersonState.Idle && Math.random() < 0.01) {
          this._changeState(person, person.state, PersonState.Start_Walking);
          person.isMoving = true;
          person.path[0] = [person.currTile[0], person.currTile[1]];
        }
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
          const xPos = getXPos(person.currTile[1]);
          const yPos = getYPos(person.currTile[0]);
          this._teleportPerson(person, xPos, yPos);

          // TODO: Change of state check
          const randomChance = Math.random();
          if (person.state === PersonState.Wandering
            && this._gridManagerService.getTileValue(person.currTile[0], person.currTile[1], 0) === TileValues.Sidewalk
            && randomChance < 0.1) {
              this._changeState(person, person.state, PersonState.Walking);
              person.path.length = 1;
          } else if (person.state === PersonState.Walking && randomChance < 0.1) {
            this._changeState(person, person.state, PersonState.Crossing_Street);
            person.path.length = 1;
          } else if (person.state === PersonState.Crossing_Street && person.path.length === 1) {
            this._changeState(person, person.state, PersonState.Walking);
            person.path.length = 1;
          }

        // Still in between tiles, move a little closer to next tile.
        } else {
          const nextMove = this._calculatePersonNextMove(person);
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

          if (person.state === PersonState.Crossing_Street) {
            const nextMove = this._crossStreetModifier(person);
            const path = this._getShortestPath(person.currTile[0], person.currTile[1], nextMove[0], nextMove[1]);

            if (path.length > 1) {
              person.path = path;
              person.isMoving = true;
              this._changePersonDirection(index, this._calculatePersonsNewDirection(person));
            } else {
              person.isMoving = false;
            }
          } else if (person.state === PersonState.Wandering) {
            let count = 0;
            do {
              count++;
              const colScalar = Math.random() < 0.5 ? -1 : 1;
              const rowScalar = Math.random() < 0.5 ? -1 : 1;
              const colMag = Math.floor(Math.random() * 5);
              const rowMag = Math.floor(Math.random() * 5);
              const col = person.currTile[1] + (colScalar * colMag);
              const row = person.currTile[0] + (rowScalar * rowMag);
              if (this._gridManagerService.isInBounds(row, col) && !this._gridManagerService.isBlocking(row, col)) {
                const path = this._getShortestPath(person.currTile[0], person.currTile[1], row, col);
                if (path.length > 1) {
                  person.path = path;
                  person.isMoving = true;
                  this._changePersonDirection(index, this._calculatePersonsNewDirection(person));
                }
              }
            } while (!person.isMoving && count < 10);

            if (!person.isMoving) {
              this._changeState(person, person.state, PersonState.Idle);
            }
          } else if (person.state === PersonState.Walking || person.state === PersonState.Start_Walking) {
            const currTile = person.currTile;
            // Found special tile (door)
            if (this._gridManagerService.getTileValue(currTile[0], currTile[1], 2) === 1 && person.state !== PersonState.Start_Walking) {
              this._changeState(person, person.state, PersonState.Idle); // TODO: Deciding
              this._changePersonDirection(index, this._gridManagerService.getTileValue(currTile[0], currTile[1], 3));
              person.canvas.style.transform = 'rotate(' + person.currRotation + 'deg)';
            } else {
              const cTile = person.currTile;
              const dir = fourSidesMods.find(mods => this._gridManagerService.isInBounds(cTile[0] + mods[0], cTile[1] + mods[1]) && this._gridManagerService.getTileValue(cTile[0] + mods[0], cTile[1] + mods[1], 0) === TileValues.Sidewalk);
              const nextMove = [currTile[0] + dir[0], currTile[1] + dir[1]];
              // Move forward
              if (!this._gridManagerService.isBlocking(nextMove[0], nextMove[1])) {
                const path = this._getShortestPath(person.currTile[0], person.currTile[1], nextMove[0], nextMove[1]);
                if (path.length > 1) {
                  person.path = path;
                  person.isMoving = true;
                  this._changePersonDirection(index, this._calculatePersonsNewDirection(person));
                  this._changeState(person, person.state, PersonState.Walking);
                }
              // Blocked
              } else {
                person.isMoving = false;
              }
            }
          }

          return;
        }

        this._changePersonDirection(index, this._calculatePersonsNewDirection(person));
      });
    const movingPeople = this._people.filter(person => person.isMoving);

    movingPeople.forEach(person => {
        this._animatePerson(person);
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
   * Calculates the (as a crow flies) distance between two tiles
   * @param row1 coordinate of the start tile
   * @param col1 coordinate of the start tile
   * @param row2 coordinate of the end tile
   * @param col2 coordinate of the end tile
   * @returns the absolute distance between two tiles
   */
  private _calculateDistance(row1: number, col1: number, row2: number, col2: number): number {
    const xDist = Math.abs(col2 - col1);
    const xDistSqr = xDist * xDist;
    const yDist = Math.abs(row2 - row1);
    const yDistSqr = yDist * yDist;
    return Math.sqrt(xDistSqr + yDistSqr);
  }

  /**
   * Calculates the next frame amount of movement the crew person must travel.
   * @param person who's next move is being calculated.
   * @returns the x,z coordinate amounts to move in those directions.
   */
  private _calculatePersonNextMove(person: Person): [number, number] {
    switch (person.currDirection) {
        case PersonDirection.Down: {
            return [0, walkingSpeed];
        }
        case PersonDirection.Down_Left: {
            return [-walkingSpeed, walkingSpeed];
        }
        case PersonDirection.Down_Right: {
            return [walkingSpeed, walkingSpeed];
        }
        case PersonDirection.Left: {
            return [-walkingSpeed, 0];
        }
        case PersonDirection.Right: {
            return [walkingSpeed, 0];
        }
        case PersonDirection.Up: {
            return [0, -walkingSpeed];
        }
        case PersonDirection.Up_Left: {
            return [-walkingSpeed, -walkingSpeed];
        }
        case PersonDirection.Up_Right: {
            return [walkingSpeed, -walkingSpeed];
        }
        default: {
            console.error('_calculatePersonNextMove: Impossible direction', person, person.currDirection);
        }
    }
  }

  /**
   * Rotates the person in the desired direction.
   * @param index person index to have its direction altered.
   * @param newDir new direction to have person face.
   */
  private _changePersonDirection(index: number, newDir: PersonDirection): void {
    const oldRotation = this._people[index].currRotation;
    this._people[index].currDirection = newDir;
    this._rotatePerson(oldRotation, this._people[index]);
  }

  /**
   * Changes person's state
   * @param person person whose state is changing.
   * @param oldState person's previous state.
   * @param newState person's new state.
   */
  private _changeState(person: Person, oldState: PersonState, newState: PersonState): void {
    console.log('_changeState', person, PersonState[oldState], PersonState[newState]);
    person.state = newState;
  }

  /**
   * Checks if the cell is already in the tested path. If it is then the new cell would make a cycle.
   * @param testPath path up to, but not including, the tested cell
   * @param testedCell the cell to use to test the path for a cycle
   * @returns TRUE if the new cell would make a cycle | False if it would not make a cycle
   */
  private _checkForCycle(testPath: number[], testedCell: number): boolean {
    return testPath.some(x => x === testedCell);
  }

  /**
   * Checks to see if a straightish line path between current tile and start tile would have been possible.
   * @param row coordinate of the tile
   * @param col coordinate of the tile
   * @param testPath path up to, but not including, the tested cell
   * @param startCell tile the person is starting from
   * @returns TRUE means there was a shorter path to current tile if in straightish line |
   * FALSE means the straightish path was longer or blocked
   */
  private _checkShorterLinearPath(row: number, col: number, testPath: number[], startCell: number): boolean {
    const startPos = this._convertCellToRowCol(startCell);
    const currLength = testPath.length;

    const nextCell = [row, col];
    let numTiles = 1; // includes current tile.
    // Bails out internally if straightish path is longer than current path (impossible) or if arrived at start tile.
    while (true) {
      const rowDiff = startPos[0] - nextCell[0];
      const colDiff = startPos[1] - nextCell[1];

      // Somewhat diagonal from starting point.
      if (rowDiff && colDiff) {
          nextCell[0] += (rowDiff / Math.abs(rowDiff));
          nextCell[1] += (colDiff / Math.abs(colDiff));
      // Perfectly horizontal from starting point.
      } else if (colDiff) {
          nextCell[1] += (colDiff / Math.abs(colDiff));
      // Perfectly vertical from starting point.
      } else {
          nextCell[0] += (rowDiff / Math.abs(rowDiff));
      }
      numTiles++;

      // Bails out if straightish path is longer than current path (impossible).
      if (currLength <= numTiles) {
          return false;
      }

      // If we made it to start tile, and here, we can bail because path is unblocked and shorter than current path.
      if (nextCell[0] === startPos[0] && nextCell[1] === startPos[1]) {
          return true;
      }

      // Checks if next tile in straightish path is out of bounds or blocked.
      if (!this._gridManagerService.isInBounds(nextCell[0], nextCell[1]) || this._gridManagerService.isBlocking(nextCell[0], nextCell[1])) {
          return false;
      }
    }
  }

  /**
   * Converts the single unique reference number for tile into row and col values.
   * @param cell reference number of the tile
   * @returns [row, col] values belonging to given reference number
   */
  private _convertCellToRowCol(cell: number): [number, number] {
    return [Math.floor(cell / 100), (cell % 100)];
  }

  /**
   * Converts the row and col values into a single unique number for reference.
   * @param row coordinate of the tile
   * @param col coordinate of the tile
   * @returns single unique reference number belonging to given row and col values
   */
  private _convertRowColToCell(row: number, col: number): number {
    return (row * 100) + col;
  }

  /**
   * Finds a sidewalk tile across the street.
   * @param person person trying to cross the street.
   * @returns tile coordinates belonging to sidewalk tile across the street from person.
   */
  private _crossStreetModifier(person: Person): [number, number] {
    const currTileRow = person.currTile[0];
    const currTileCol = person.currTile[1];
    let found = 0;
    // Check down
    for (let a = 1; a < 5; a++) {
      if (this._gridManagerService.isInBounds(currTileRow + a, currTileCol) && this._gridManagerService.getTileValue(currTileRow + a, currTileCol, 0) === TileValues.Street) {
        found = a;
      }
    }
    if (found) {
      for (let a = found; a < found + 5; a++) {
        if (this._gridManagerService.getTileValue(currTileRow + a, currTileCol, 0) === TileValues.Sidewalk) {
          return [currTileRow + a, currTileCol];
        }
      }
    }

    // Check up
    for (let b = 1; b < 5; b++) {
      if (this._gridManagerService.isInBounds(currTileRow - b, currTileCol) && this._gridManagerService.getTileValue(currTileRow - b, currTileCol, 0) === TileValues.Street) {
        found = b;
      }
    }
    if (found) {
      for (let b = found; b < found + 5; b++) {
        if (this._gridManagerService.getTileValue(currTileRow - b, currTileCol, 0) === TileValues.Sidewalk) {
          return [currTileRow - b, currTileCol];
        }
      }
    }

    // Check right
    for (let c = 1; c < 5; c++) {
      if (this._gridManagerService.isInBounds(currTileRow, currTileCol + c) && this._gridManagerService.getTileValue(currTileRow, currTileCol + c, 0) === TileValues.Street) {
        found = c;
      }
    }
    if (found) {
      for (let c = found; c < found + 5; c++) {
        if (this._gridManagerService.getTileValue(currTileRow, currTileCol + c, 0) === TileValues.Sidewalk) {
          return [currTileRow, currTileCol + c];
        }
      }
    }

    // Check left
    for (let d = 1; d < 5; d++) {
      if (this._gridManagerService.isInBounds(currTileRow, currTileCol - d) && this._gridManagerService.getTileValue(currTileRow, currTileCol - d, 0) === TileValues.Street) {
        found = d;
      }
    }
    if (found) {
      for (let d = found; d < found + 5; d++) {
        if (this._gridManagerService.getTileValue(currTileRow, currTileCol - d, 0) === TileValues.Sidewalk) {
          return [currTileRow, currTileCol - d];
        }
      }
    }

    return [0, 0];
  }

  /**
   * Recursive function to find each path that leads to the target cell.
   * @param nextRow row coordinate of the next tile.
   * @param nextCol column coordinate of the next tile.
   * @param targetRow row coordinate of the final tile.
   * @param targetCol column coordinate of the final tile.
   * @param testPath used to push and pop values depending on the success of the path.
   * @param targetCell reference number fot the cell person is trying to reach.
   * @returns true if this cell is target cell, false if path is blocked, out of bounds, too long, cyclical, or meandering.
   */
  private _getShortestPathRec(
    nextRow: number,
    nextCol: number,
    targetRow: number,
    targetCol: number,
    testPath: number[],
    targetCell: number
  ): boolean {
    const nextCell = this._convertRowColToCell(nextRow, nextCol);
    testPath.push(nextCell);

    // If potential path reaches 50 or more tiles, it's already too long. Bail out early (too long).
    if (testPath.length >= 65) {
      console.log('Path too long. Bail out early.');
      return false;
    }

    // Found the target, time to bail out.
    if (nextCell === targetCell) {
      return true;
    }

    // There is a shorter, straightish (unblocked) path between this point and starting point. Bail out early (meandering).
    if (this._checkShorterLinearPath(nextRow, nextCol, testPath, testPath[0])) {
      return false;
    }

    // List of neighboring tiles to starting point, ordered by closeness to target cell.
    const closenessScores = adjacencyMods
      // Gets row, col, and distance of considered tile with target tile.
      .map(mod => {
        const testedRow = nextRow + mod[0];
        const testedCol = nextCol + mod[1];
        return [testedRow, testedCol, this._calculateDistance(testedRow, testedCol, targetRow, targetCol)];
      })
      // Check cells in order of closer distance to target cell
      .sort((tile1, tile2) => {
        return tile1[2] - tile2[2];
      })
      // Only in-bounds and unobstructed tiles are considered.
      .filter(tile => {
        return this._gridManagerService.isInBounds(tile[0], tile[1]) && !this._gridManagerService.isBlocking(tile[0], tile[1]);
      });

    // Check paths leading out from these neighboring cells.
    for (const tile of closenessScores) {
      const nextNextCell = this._convertRowColToCell(tile[0], tile[1]);

      // If -1 in the memoization table, then we've already looked at this cell and found it to be a failure.
      if (pathFindMemo[nextNextCell] === -1 || pathFindMemo[nextNextCell] < (testPath.length + 1)) {
        continue;
      }

      // Avoid revisiting a tile that's already in possible path, otherwise infinite looping can happen.
      if (this._checkForCycle(testPath, nextNextCell)) {
        continue;
      }

      // If adjacent cell is the target cell, add it and bail.
      if (nextNextCell === targetCell) {
        testPath.push(nextNextCell);
        pathFindMemo[nextNextCell] = testPath.length;
        return true;
      }

      // If path proves true, go all the way back up the rabbit hole.
      if (this._getShortestPathRec(tile[0], tile[1], targetRow, targetCol, testPath, targetCell)) {
        return true;
      }

      // If path proves false, pop the last cell to prepare for the next iteration.
      pathFindMemo[testPath.pop()] = -1;
    }
    // All neighboring options proved to be cyclical. Bail out (cycle).
    return false;
  }

  /**
   * Parent function to the recursive path finding function calls. Chooses the path with the least number of cells.
   * @param row1 coordinate of the start tile
   * @param col1 coordinate of the start tile
   * @param row2 coordinate of the end tile
   * @param col2 coordinate of the end tile
   * @returns path of [row, col] values that lead to target cell. Empty means not a valid path
   */
  private _getShortestPath(row1: number, col1: number, row2: number, col2: number): [number, number][] {
    // Rest Memoization table.
    pathFindMemo = {};

    // TODO: For now, don't let person travel to blocked tile. Eventually pick an adjacent tile.
    if (this._gridManagerService.isBlocking(row2, col2)) {
      return [];
    }

    const startCell = this._convertRowColToCell(row1, col1);
    const targetCell = this._convertRowColToCell(row2, col2);

    // Person is already in that cell. Bail out early.
    if (startCell === targetCell) {
      return [];
    }

    // List of neighboring tiles to starting point, ordered by closeness to target cell.
    const closenessScores = adjacencyMods
      // Gets row, col, and distance of considered tile with target tile.
      .map(mod => {
        const testedRow = row1 + mod[0];
        const testedCol = col1 + mod[1];
        return [testedRow, testedCol, this._calculateDistance(testedRow, testedCol, row2, col2)];
      })
      // Check cells in order of closer distance to target cell
      .sort((tile1, tile2) => {
        return tile1[2] - tile2[2];
      })
      // Only in-bounds and unobstructed tiles are considered.
      .filter(tile => {
        return this._gridManagerService.isInBounds(tile[0], tile[1]) && !this._gridManagerService.isBlocking(tile[0], tile[1]);
      });

    // Check paths leading out from these neighboring cells.
    const path = [startCell];
    for (const tile of closenessScores) {
      const nextCell = this._convertRowColToCell(tile[0], tile[1]);

      // If adjacent cell is the target cell, add it and bail.
      if (nextCell === targetCell) {
        path.push(nextCell);
        return path.map(cell => this._convertCellToRowCol(cell));
      }

      // If final cell is target cell, we've found our shortest path.
      if (this._getShortestPathRec(tile[0], tile[1], row2, col2, path, targetCell)) {
        return path.map(cell => this._convertCellToRowCol(cell));
      }
    }

    // Having reached this point, there was no viable path to target cell.
    return [];
  }

  /**
   * Checks to see if person is close enough to center of next tile to consider it arrived.
   * @param person person who's position is checked against next tile in its path.
   * @returns whether or not person has arrived at next tile. TRUE has arrived | FALSE has not arrived.
   */
  private _hasPersonArrivedAtCell(person: Person): boolean {
    const currPos = person.position;
    const tileCoords = person.path[1];

    const yDist = getYPos(tileCoords[0]) - currPos[1];
    const xDist = getXPos(tileCoords[1]) - currPos[0];

    const dist = Math.sqrt((yDist * yDist) + (xDist * xDist));

    if (dist <= walkingSpeed + 0.001) {
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
      this._gridManagerService.setTileValue(row, col, 1, 0);
      return 0;
    }

    const tileVal: number = Number(person) + 1;
    if (this._gridManagerService.isInBounds(row, col) && (!this._gridManagerService.isBlocking(row, col))) {
      this._gridManagerService.setTileValue(row, col, 1, tileVal);

      return tileVal;
    }

    // Row/Col not in range or blocked.
    return 0;
  }

}
