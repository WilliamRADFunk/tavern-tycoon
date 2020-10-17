import { Injectable } from '@angular/core';
import { Person, PersonState } from '../models/person';
import { GridManagerService, TileValues } from './grid-manager.service';
import { PathFinderService } from './path-finder.service';

const FOUR_SIDES_MODS: [number, number][] = [ [1, 0], [0, 1], [-1, 0], [0, -1] ];

@Injectable({
  providedIn: 'root'
})
export class PersonManagerService {

  constructor(private readonly _gridManagerService: GridManagerService,
    private readonly _pathFinderService: PathFinderService) { }

  /**
   * Changes person's state
   * @param person person whose state is changing.
   * @param oldState person's previous state.
   * @param newState person's new state.
   */
  private _changeState(person: Person, oldState: PersonState, newState: PersonState): void {
    console.log('_changeState', person, PersonState[oldState], PersonState[newState]);
    person.prevState = oldState;
    person.state = newState;
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
   * From stopped position (ie. IDLE or BLOCKED) decide whether to change to a moving state.
   * @param person person who is deciding whether or not to change their state.
   */
  public decideFromStandstill(person: Person): void {
    if (person.path[1] && !this._gridManagerService.isBlocking(person.path[1][0], person.path[1][1])) {
      person.isMoving = true;
    } else if (person.state === PersonState.Idle && Math.random() < 0.01) {
      this._changeState(person, person.state, PersonState.Start_Walking);
      person.isMoving = true;
      person.path[0] = [person.currTile[0], person.currTile[1]];
    }
  }

  /**
   * At game start, person will decide their state.
   * @param person person who is deciding whether or not to change their state.
   */
  public decideInit(person: Person): void {
    // TODO: Have a better init algorith than just move right two squares.
    person.path = this._pathFinderService.getShortestPath(person.currTile[0], person.currTile[1], person.currTile[0], person.currTile[1] + 2);
    person.isMoving = true;
  }

  /**
   * At each tile along a person't path, person will have a chance to change their state.
   * @param person person who is deciding whether or not to change their state.
   */
  public decideMidstream(person: Person): void {
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
  }

  /**
   * At last tile in a person't path, person will decide what state to have next.
   * @param person person who is deciding whether or not to change their state.
   */
  public decideNext(person: Person): void {
    if (person.state === PersonState.Crossing_Street) {
      const nextMove = this._crossStreetModifier(person);
      const path = this._pathFinderService.getShortestPath(person.currTile[0], person.currTile[1], nextMove[0], nextMove[1]);

      if (path.length > 1) {
        person.path = path;
        person.isMoving = true;
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
          const path = this._pathFinderService.getShortestPath(person.currTile[0], person.currTile[1], row, col);
          if (path.length > 1) {
            person.path = path;
            person.isMoving = true;
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
        // this._changePersonDirection(person, this._gridManagerService.getTileValue(currTile[0], currTile[1], 3));
        person.canvas.style.transform = 'rotate(' + person.currRotation + 'deg)';
      } else {
        const cTile = person.currTile;
        const dir = FOUR_SIDES_MODS.find(mods => this._gridManagerService.isInBounds(cTile[0] + mods[0], cTile[1] + mods[1]) && this._gridManagerService.getTileValue(cTile[0] + mods[0], cTile[1] + mods[1], 0) === TileValues.Sidewalk);
        const nextMove = [currTile[0] + dir[0], currTile[1] + dir[1]];
        // Move forward
        if (!this._gridManagerService.isBlocking(nextMove[0], nextMove[1])) {
          const path = this._pathFinderService.getShortestPath(person.currTile[0], person.currTile[1], nextMove[0], nextMove[1]);
          if (path.length > 1) {
            person.path = path;
            person.isMoving = true;
            this._changeState(person, person.state, PersonState.Walking);
          }
        // Blocked
        } else {
          person.isMoving = false;
        }
      }
    }
  }
}