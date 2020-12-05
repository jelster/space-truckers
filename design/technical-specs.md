
# Application platform - tech specs

* _Space Trucker_ should run in all modern web browsers that support WebGL2 and ECMA6
* :question: Although access to the local IndexedDB, storage, and such will allow assets to be cached, it should not be required to run the game
* If the game's assets have already been retrieved and cached locally, an internet connection should not be required to run the game

## UI / UX Fundamentals

### Output

The primary platform being targeted is the web browser, with either a traditional computer monitor setup or a mobile or tablet screen form factor.

### Input

Multiple types of input devices will be supported:

* Keyboard
* Mouse
* Gamepad
* Touch screen

## High-level game state

### Game states

### Application states

* Loading state happens when assets or scenarios are being retrieved and compiled.
  * Transitioning out of Loading occurs when all relevant assets have been retrieved and instantiated either from local storage cache or as the result of a remote web request
  * Examples:
    * First time running the game
    * First run after a new release has been pushed out
    * Player selects a level in the level select screen
    * Game resumes from suspension
* Initializing state is when game objects are allocated, hydrated, populated, etc. and the game is ready for rendering and interaction
* Running is while gameplay is actively being processed. Can include menu dialogs. Has two sub-states:
  * Paused
  * Active
* Terminating phase occurs when the player loses, completes, or exits a running game scenario
  * State serialization and persistence to local storage
  * Cleanup of resources
