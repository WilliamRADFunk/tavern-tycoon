# TavernTycoon

Own and operate a simulated tavern/bar.

My desire is to use this game to make the experience as accessible as possible. My goal is that a blind person can seamlessly play without additional difficulty as long as they are already familiar with basic web accessibility technologies. Since the game will be built entirely with HTML/CSS/JS, there shouldn't be any reason normal web accessibility standards can't be applied. 

## Phase 1 Development:

Basic controls and map available to buy and sell goods, make improvements like more tables/seating, and a number of random events player must navigate for better or worse.

Initial loss condition is either to be closed by the health department, or go into debt for a period of time.

Win condition is to consistently make x dollars per cycle for y cycles.

:white_check_mark: Setup initial Angular project with all the necessary dependencies.

:black_square_button: Create the three main layers: Tavern layout, UI overlay, Settings/Options/Etc..

:black_square_button: Create top-down grid system that can be toggled (in)visible.

:black_square_button: Highlight grid tiles based-on mouse hover, arrow keys, and shape of object to be placed.

:black_square_button: Add build options button, that opens build categories buttons (placement should be dynamic as categories may not always be available).

:black_square_button: Clicking on build option category should open menu of buildable options with their graphics, prices, and opacity to show can(not) be purchased.

:black_square_button: Add UI Overlay are to display current finances, max occupancy, current occupancy, current health department score, popularity score, amount made that "day".

:black_square_button: Create main menu with basic start, difficulty setting, load, other options (keyboard only, mouse only, mouse and keyboard, sound, etc.).

:black_square_button: Add a "research" button. Player can spend experience points on new products to purchase and sell, tables that allow for more seating, entertainment bonuses like trivia nights, etc..

## Phase 2 Development:

Add a competitor. Basic AI tavern/bar located nearby or nextdoor.

Proximity will depend on a difficulty level set by player.

Added lose condition. If competitor's popularity score reaches 100%, you've lost. The inverse is true for a win condition.

Added random events added that both player and AI will have to navigate.

:black_square_button: Add ...

## Phase 3 Development:

At a certain level of development, player can evolve the tavern through the ages. As the concept of taverns have evolved over the century into modern bars, the player can start in ancient times and progress through the various epochs.

At each epoch, there will be a new AI competitor that must be defeated. They will begin with a certain level of resources that is higher for each epoch, and no less than comparable to what player has when they start the epoch.

:black_square_button: Add ...