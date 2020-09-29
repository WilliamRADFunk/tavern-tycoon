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

:black_square_button: In research and renovation there should be "paths" like the difference between bar and pub, tavern and innkeeper, etc..

:black_square_button: Add UI display for the little people when selected. If patron, it would show available cash, disposition, and possibly their drink preferences. If employee, it will show their basic stats, fatigue, amount they get paid, and morale.

:black_square_button: Show road/street/ outside where people are walking by at random.

:black_square_button: Show other side of street with entrances to other businesses that some of the people walk in and out of.

:black_square_button: Algorithm to determine when people walking by decide to enter the tavern.

:black_square_button: Algorithm for how people move around the inside of the tavern.

:black_square_button: Algorithm for what and how often patrons purchase goods. Propensity to drink more or less. Throw up or not.

:black_square_button: Add table for gambling as an add on. The house collects a fee, but also encourages patrons to be more violent (destroying tables and chairs...and other patrons).

:black_square_button: Add random encounter generator, that lets user choose among certain options for rewards or penalties.

:black_square_button: Add random challenges generator, that if accepted player can get bonuses if achieved, or penalties if not.

:black_square_button: Result of random encounters and challenges appear in bulletin posters or newspaper articles for a bit of flavor.

:black_square_button: Add thought bubbles for the patrons, and the algorithm that generates them.

:black_square_button: Add lose condition for time spent in debt.

:black_square_button: Add win condition for certain profits over consistent period of time.

:black_square_button: Add day/night cycle.

:black_square_button: Exchange money for goods at bar interaction.

:black_square_button: Drinking animation.

:black_square_button: Each patron tracks state of drink.

:black_square_button: When drink or plate is empty, the patron loses the item, and the table/bar gains the item. The server must remove the item from table and track it until arriving at specific location.

:black_square_button: Tavern tracks total number of items like plates and mugs. When all mugs are in use, no new mugs of ale can be purchased, thus bussing the tables is an important part of the process.

:black_square_button: Algorithm to track instances of irritating behavior toward servers. A setting can be made to control how often the tavern keeper whacks a patron in rebuke. Too much, and you'll get fewer patrons. Not enough, and the staff will have low morale and perform poorly.

:black_square_button: At certain level of prosperity, player can higher bouncers/guards. These control level of distruction when patrons get violent, and fight back when patrons try to steal from the tavern.

:black_square_button: Items have state: good condition, damaged, and broken. Broken can't be used. Damaged can be used but lowers people's opinions of the bar (should have a total score). Good condition can be used and improves the overall score for people's opinion of the tavern.

:black_square_button: Add state machine for the tavern. In operation, renovation, paused, closed. Only while "in operation" is the normal flow of the game not frozen.

:black_square_button: Track the passage of time.

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