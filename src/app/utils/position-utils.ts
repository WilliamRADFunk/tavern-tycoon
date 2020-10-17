import { Person, PersonDirection } from '../models/person';

export const GetXPos: (col: number) => number = (col) => {
    return (col * 64);
};

export const GetYPos: (row: number) => number = (row) => {
    return (row * 64);
};

export const TURN_DEG = {
    RAD_90_DEG_LEFT: 90,
    RAD_45_DEG_LEFT: 45,
    RAD_180_DEG_LEFT: 180,
    RAD_135_DEG_LEFT: 135,
    RAD_225_DEG_LEFT: 225,
    RAD_270_DEG_LEFT: 270,
    RAD_315_DEG_LEFT: 315
};

/**
 * Calculates the (as a crow flies) distance between two tiles
 * @param row1 coordinate of the start tile
 * @param col1 coordinate of the start tile
 * @param row2 coordinate of the end tile
 * @param col2 coordinate of the end tile
 * @returns the absolute distance between two tiles
 */
export const CalculateDistance: (row1: number, col1: number, row2: number, col2: number) => number = (row1, col1, row2, col2) => {
    const xDist = Math.abs(col2 - col1);
    const xDistSqr = xDist * xDist;
    const yDist = Math.abs(row2 - row1);
    const yDistSqr = yDist * yDist;
    return Math.sqrt(xDistSqr + yDistSqr);
}

/**
 * Based on the difference in row and column of current person tile and their next, this finds new person direction.
 * @param Person whose new direction is to be calculated.
 * @returns the new direction the person should be facing.
 */
export const CalculatePersonsNewDirection: (person: Person) => PersonDirection = (person) => {
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

/**
 * Calculates the next frame amount of movement the crew person must travel.
 * @param person who's next move is being calculated.
 * @returns the x,z coordinate amounts to move in those directions.
 */
export const CalculatePersonNextMove: (person: Person, speed: number) => [number, number] = (person, speed) => {
    switch (person.currDirection) {
        case PersonDirection.Down: {
            return [0, speed];
        }
        case PersonDirection.Down_Left: {
            return [-speed, speed];
        }
        case PersonDirection.Down_Right: {
            return [speed, speed];
        }
        case PersonDirection.Left: {
            return [-speed, 0];
        }
        case PersonDirection.Right: {
            return [speed, 0];
        }
        case PersonDirection.Up: {
            return [0, -speed];
        }
        case PersonDirection.Up_Left: {
            return [-speed, -speed];
        }
        case PersonDirection.Up_Right: {
            return [speed, -speed];
        }
        default: {
            console.error('_calculatePersonNextMove: Impossible direction', person, person.currDirection);
        }
    }
}



/**
 * Converts the single unique reference number for tile into row and col values.
 * @param cell reference number of the tile
 * @returns [row, col] values belonging to given reference number
 */
export const ConvertCellToRowCol: (cell: number) => [number, number] = (cell) => {
    return [Math.floor(cell / 100), (cell % 100)];
}

/**
 * Converts the row and col values into a single unique number for reference.
 * @param row coordinate of the tile
 * @param col coordinate of the tile
 * @returns single unique reference number belonging to given row and col values
 */
export const ConvertRowColToCell: (row: number, col: number) => number = (row, col) => {
    return (row * 100) + col;
}