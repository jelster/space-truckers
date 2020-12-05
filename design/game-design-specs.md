# Space Trucker game mechanics

## Basic design overview

In _Space Trucker_, players are in charge of a cargo shipping installation out among the asteroids. Miners send out raw materials to orbital factories, which in turn send finished goods out to the miners. Gigantic mass drivers give outgoing pods the initial kick needed to get things moving in the right direction or perform the reverse to catch incoming freight in an intricate ballet of megatonnage in constant dynamic motion around the Sun. It's the Great Circle of life, some might say. Others say that's nonsense because things move in more than just 2-D directions, but it really doesn't matter because there are schedules to make and deadlines to keep! That asteroid ore isn't going to move itself. and the star wait for no one, after all...

Gameplay is divided into different phases. Taking place sequentially, the events in each phase provide the input for the phases following it.

### Phase one: cargo selection

This is the freight exchange, where those in need of a space-trucker go to list their cargo for shipment bids. The board displays the vital stats for each listed piece of cargo, including figures like:

* Number of cargo pods
* Time limit on delivery
* Type (e.g., plants, ore, microchips)
* Gross mass of cargo pallet
* Is the cargo hazardous?
* Does the cargo require special handling (e.g., maintain temp range)?
* Is insurance available for the cargo?
* Destination depot
* (the most important) How much is being offered to ship the cargo

Players choose contracts to take on for delivery. There is no limit on the number of simultaneous contracts that can be accepted, but a practical limitation on getting cargo to different destinations exists only to the player's limit on creativity. That and the player's current gross mass tolerances - physics gotta do physics!

### Phase two: trip planning

A suitably-zoomed view of the planetary system plots the current locations of the player's home base along with the selected cargo's destination(s). The goal of this phase for players is to come up with a "flight plan" for their haulage. Some aspects of the planning are resource-limited, meaning that for instance that players will need to anticipate the costs for fuel, mass-driver access, and other haulage requirements. These costs will be tracked and displayed as a running total to the player.

Planning specials that players can spend space-bucks on are used immediately as part of the current planning phase. They are meant to provide players direct advantage in planning and executing on their route. If players do not make use of a space-truck, they will need to make sure they have _very_ good aim when lining up their launch...

Purchases used during planning phase:

* Space Guard survey data
* Intel gathering
* Set up haul as a smuggling run - an off-the-books operation

Purchases applied towards future phases:

* Mass driver usage
  * number of pods
  * max acceleration (&delta;V)
* (optional) Space-truck lease/rental. A space-truck can be given responsibility of a certain number of freight pods, which they are then able to take with them to arbitrary destinations after the initial mass driver launch.
* (optional) Space-truck fuel. How much &delta;V to load into space-trucks guiding the cargo

### Phase three: Launch and hit the road

Our perspective shifts to the mass driver installation, where players can do a countdown before hitting the Big Red Button, or they can simply PUSH THE BUTTON - it's a personal decision.

We ride along with the cargo as it is slung at incredibly high accelerations and velocities out of the mass driver and on the trajectory specified in the planning phase.

If the player didn't include a space-truck, then there's no actions that the player can take aside from taking in the view... or blow up the whole thing with an emergency abort (self-destruct).

Space-trucks give players agency over a cargo run while it is still ongoing. They can use the fuel loaded in planning phase to exectute changes to the cargo run's trajectory, which can make the difference between making or failing a delivery. They can also subdivide their loads (LTL!), leaving one set of pods to the original path while taking the rest to a different destination.

Players rotate their space-truck to orient themselves to a desired direction, and can accelerate towards that by applying thrust. The actual acceleration experienced will depend on how much load the space-truck is hauling - heavier loads won't accelerate as quickly as lighter ones.

This can be important, because there are numerous hazards along the way. Some hazards are passive, like space-junk or space-rocks. Others are more aggressive in nature and will make attempts to hamper, impede, steal, or even destroy cargo!

Possible passive threats:

* Space-junk
* Space-rocks / comet debris
* Space-hulks
* Solar storms

Example of possible hostiles:

* Space-police (for smuggling hauls)
* Space-pirates - sailing the sky with solar sails flying the jolly roger!
* Space-beasts

### Phase four: Results and consequences

This is the final game phase, and is where players view the results of their haul and count their earnings (or losses!). The freight contract specifies base compensation amounts, but the actual amounts awarded may vary by some factors:

* Timeliness - some contracts may pay early delivery bonus, others stiff late fees
* Condition of cargo - hopefully, everything arrives in one piece. If not, damages are taken out of the player's earnings
* Completion of delivery - at least one cargo pod arrived at its' destination. Ideally all of them will be credited with this factor.
* Other TBD

## Platform - tech specs

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
