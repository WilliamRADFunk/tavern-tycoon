/**
 * Essential information that each person must have to fascilitate the functioning in the game.
 */
export interface Person {
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
     * Flag to signal recalculate of position or rotation despite normal flow.
     */
    needsUpdate?: boolean;

    /**
     * Row, Column tile position of the person.
     */
    position: [number, number];

    /**
     * Previous state of the person.
     */
    prevState: PersonState;

    /**
     * Current state of the person.
     */
    state: PersonState;

    /**
     * Value to place on tile's level layer when person is occupying it.
     */
    tileValue: number;
}

export enum PersonDirection {
    'Down' = 1,
    'Down_Left' = 2,
    'Left' = 3,
    'Right' = 4,
    'Down_Right' = 5,
    'Up' = 6,
    'Up_Left' = 7,
    'Up_Right' = 8,
}

export enum PersonState {
    'Crossing_Street' = 0,
    'Deciding' = 1,
    'Idle' = 2,
    'Walking' = 3,
    'Wandering' = 4
}
