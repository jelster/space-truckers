# Space Trucker game mechanics

Thematic inspirations: Futurama, Borderlands

## Basic design overview

In _Space Trucker_, players are in charge of a cargo shipping installation out among the asteroids. Miners send out raw materials to orbital factories, which in turn send finished goods out to the miners. Gigantic mass drivers give outgoing pods the initial kick needed to get things moving in the right direction or perform the reverse to catch incoming freight in an intricate ballet of megatonnage in constant dynamic motion around the Sun. It's the Great Circle of life, some might say. Others say that's nonsense because things move in more than just 2-D directions, but it really doesn't matter because there are schedules to make and deadlines to keep! That asteroid ore isn't going to move itself. and the star wait for no one, after all...

![space trucker concept art](/design/Space_Trucker_Concept_Art.jpg)

Gameplay is divided into different phases. The initial phase is where players can to set and see the contract parameters. The main gameplay phase can be likened to a roller coaster game, except without a track.

[ed: strikeout left for ref]

~~### Phase one: cargo selection~~

~~This is the freight exchange, where those in need of a space-trucker go to list their cargo for shipment bids. The board displays the vital stats for each listed piece of cargo, including figures like:~~

* ~~Number of cargo pods~~
* ~~Time limit on delivery~~
* ~~Type (e.g., plants, ore, microchips)~~
* ~~Gross mass of cargo pallet~~
* ~~Is the cargo hazardous?~~
* ~~Does the cargo require special handling (e.g., maintain temp range)?~~
* ~~Is insurance available for the cargo?~~
* ~~Destination depot~~
* ~~ (the most important) How much is being offered to ship the cargo~~

~~Players choose contracts to take on for delivery. There is no limit on the number of simultaneous contracts that can be accepted, but a practical limitation on getting cargo to different destinations exists only to the player's limit on creativity. That and the player's current gross mass tolerances - physics gotta do physics!~~

### Phase one: trip planning

A suitably-zoomed view of the planetary system displays the player's current cargo contract details - the destination, types of goods etc. Importantly as well, the map shows Truck Stops along the route. Truck Stops are places along well-traveled space-roads that give passing space-truckers an opportunity to grab a bit and relieve themselves, a small but important bit of the interplanetary economy. Stopping at one of these can be critical to completing a contract, but isn't required.

A key part of trip planning is the choice of launch speeds. In exchange for a lower score multiplier, players may choose to impart more (or the converse) velocity at launch. A higher launch velocity means a faster run, and potentially a lower overall trip time.  

Player choices made towards future phases:

* max acceleration (&Delta;V) chosen
* (optional) Solar Storm Shelter provides players resistance to a solar flare, but the increased mass makes a trailer more difficult to maneuver
* (optional) Transit insurance that pays out a percentage of losses to the player. Requires a non-refundable deposit to secure, but can help reduce risk and lets a player hedge their bets

### Phase two: Hitting the space-road

#### Launch

Our perspective shifts to the mass driver installation, where players can do a countdown before hitting the Big Red Button, or they can simply PUSH THE BUTTON - it's a personal decision.

We ride along with the cargo as it is slung at incredibly high accelerations and velocities out of the mass driver and on the trajectory specified in the planning phase.

#### Maneuvering

Players can rotate their space-truck to orient themselves to a desired direction, and can accelerate towards that by applying thrust. The actual acceleration experienced will depend on how much load the space-truck is hauling - heavier loads won't accelerate as quickly as lighter ones.

This can be important, because there are numerous hazards along the way. Some hazards are passive, like space-junk or space-rocks. Others are more aggressive in nature and will make attempts to hamper, impede, steal, or even destroy cargo!

Possible threats:

* Space-junk
* Space-rocks / comet debris
* Space-hulks
* Solar storms
* Space-beasts
* Gravitational anomalies

#### Time

Riding empty space does funny things to a person's sense of time. When a driver is "in the pipe, 5x5" it's almost as if time and space bend and twist; things speeds up for the driver. It's also a Well Known-Established Fact that the same sense of time is directly proportional to both how full their bladder is along with the emptiness of the stomach. A full bladder and empty stomach is a bad combination! If the space-trucker's bladder ever reaches full capacity and the player has no emergency "relief bottles", they'll have to pull over and do the needful wherever possible. Hopefully that will be at a Truck Stop, because if it's not the player fails the scenario. A lack of food makes a person drowsy and less attentive - it can only take a moment's inattention to drift off-course and end up Lost in Space.

#### Hunger and Bladder Control

Players have two resources during this phase, represented by two values

* Stomach Meter - drains over time and due to player or hostile action. As it empties, players gradually experience more and more random control movements -- drifting -- that makes it difficult to control the vehicle
* Bladder Bar - fills over time. May be affected by external factors, but is mostly an hourglass-type of measure. If it ever reaches full capacity the game is over.

#### Truck Stops

Players may encounter one or more Truck Stops during the course of delivering their cargo. Pulling into one of these stops drains the space-trucker's Bladder Bar while filling their Stomach Meter. The cost of this of course is a lower final score, but it can be worth it in longer hauls.

#### Completing the mission

When/if the space-truck approaches a potential destination, the local space-traffic control takes over terminal guidance, ending the game phase.

### Phase three: Results and scoring

This is the final game phase, and is where players view the results of their haul and count their earnings (or losses!). The freight contract specifies base compensation amounts, but the actual amounts awarded may vary by some factors:

* Timeliness - some contracts may pay early delivery bonus, others stiff late fees
* Condition of cargo - hopefully, everything arrives in one piece. If not, damages are taken out of the player's earnings
* Completion of delivery - at least one cargo pod arrived at its' destination. Ideally all of them will be credited with this factor.
* Other TBD
