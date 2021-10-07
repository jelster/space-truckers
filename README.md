
# Space-Truckers: The Video Game

- [Space-Truckers: The Video Game](#space-truckers-the-video-game)
  - [About the game](#about-the-game)
  - [How to Play](#how-to-play)
    - [Menus](#menus)
    - [Route Planning](#route-planning)
  - [Building the Application from Source](#building-the-application-from-source)
  - [Concepts](#concepts)
  - [Getting Help and Providing Feedback](#getting-help-and-providing-feedback)
  - [Conceptual sketches](#conceptual-sketches)

**A game of getting stuff from Point A to Point B... IN SPAAAACCE!**

Space-Truckers is an OSS project intended to demonstrate key concepts of integrating the [BabylonJS](https://babylonjs.com/) WebGL/WebGPU framework into a web-based interactive application.  

![space trucker concept art](/design/Space_Trucker_Concept_Art.jpg)

## About the game

Gameplay in Space-Truckers is divided into three distinct phases: planning, driving, and scoring.

In the planning phase, your simulated cargo container (a.k.a. your trailer) starts in orbit around one of the system's planets.
The overall goal is to plan a course that will take the cargo pod to its' destination - or at least close enough to intersect the destination
planet's retrieval systems, but you won't have the benefit of being able to make course changes once you've launched on your journey - say a prayer to
Sir Isaac Newton, because it is the gravitational forces of the star and its' attendant planets that will bend and alter the ballistic path of your cargo post-launch!

Before launch though, you'll be able to specify the precise direction, force, and timing of your cargo so you can line up the perfect route. Better routes are ones that have a higher potential score. The potential score is determined by a number of factors, including the length of the route (longer routes have more opportunity to gain score, but risk losing even more points in time penalties), the amount of time in transit, average speed, and more.

During planning, the simulation can be reset as many times as needed - that's why it's a simulation, after all! When you've launched on a successful route, you'll have the option to either accept the route or reset and try again. Accepting the route takes you to the next game phase, where you'll ride along with your cargo in your Space-Tractor, helping to nudge and guide it through a series of challenges encountered along the route.

Once it's all said and done, your potential score will be displayed along with the actual score earned from the driving phase. Maybe you'll make the leaderboards someday!

## How to Play

### Menus

| Input | Key(s) | Action |
|------|-------|------ |
D-Pad Up/L. Stick Up | <kbd>↑</kbd> | Move selection up
D-Pad Down/L. Stick down | <kbd>↓</kbd>| Move selection down
A/X  | <kbd>Enter</kbd>/<kbd>Return</kbd> | Confirm/Invoke selection
B/Circle | <kbd>Backspace</kbd>/<kbd>Delete</kbd> | Cancel/Go back
B/Circle | <kbd>Spacebar</kbd> | Skip cut scene (where applicable)

### Route Planning

| Input | Key(s) | Action |
| -----| ------| ---- |
Left joystick | <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> | Aim
Right joystick | Mouse Drag, <kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd><kbd>←</kbd> | Move camera
A/X | <kbd>Spacebar</kbd> <kbd>Enter</kbd> | Launch
X/Square |<kbd>Shift</kbd> <kbd>+</kbd> | Increase launch velocity
Y/Triangle | <kbd>Ctrl</kbd> <kbd>-</kbd> | Decrease launch velocity
A/X | <kbd>Spacebar</kbd> <kbd>Enter</kbd> | Confirm route
B/Circle | <kbd>Backspace</kbd> <kbd>Delete</kbd> | Retry
Menu/Select | <kbd>Esc</kbd> | Pause Menu
Start | <kbd>P</kbd> | Pause

## Building the Application from Source

Although Space-Truckers is built to run in any browser capable of using WebGL and related JavaScript API's, there are a few more requirements involved if you want to build the application and game from source code. You'll need:

- NodeJS v14+
- NPM to match

Once you've cloned the source to your local machine, you should run an `npm install` to fetch and install needed dependencies. The `/dist` folder will contain the output of running `npm run build`, but for local development the `npm run start` command will run the webpack dev-server, which allows for module hot swapping and reloading, greatly speeding up the time between making a change and seeing it reflected in a browser!

## Concepts

Design docs and sketchs are located in the [/design/](/design) folder.

- [Game design doc](/design/game-design-specs.md)
- [Technical specs doc](/design/technical-specs.md)

## Getting Help and Providing Feedback

There are a number of different ways to get assistance with an issue you may encounter. Have a question about the game? Head over to the [discussion boards](https://github.com/jelster/space-truckers/discussions) and post your question there among the various topics available, or create your own.

If you encounter a bug or issue with the game or application you can create an [Issue](https://github.com/jelster/space-truckers/issues) to help us track it, or add a comment to an existing issue that might help us understand the problem better.

Thanks for participating!

## Conceptual sketches

![mass-driver concept](/design/mass-driver-concept.png)

---

![cargo pod concept](/design/cargo-pod-concept.png)

---

![cabin chase concept](/design/cabin-ui-concept.jpg)
