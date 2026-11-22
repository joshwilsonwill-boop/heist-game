# Eko Vault - Night Heist

![make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)
![rank](https://make.fun/badge/best-heist-game-20261122-0559/joshwilsonwill-boop/heist-game/rank.svg)
![reward](https://make.fun/badge/best-heist-game-20261122-0559/joshwilsonwill-boop/heist-game/reward.svg)

A top-down stealth heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559).

You are a thief crossing the Meridian Vault in Lagos at night. Three guards patrol the floor with sweeping vision cones, two wall cameras sweep fixed arcs, and an alarm meter climbs every second you are seen. Grab the cash, the jewels and the gold bar, steal the vault core, then slip out the green exit before the alarm hits 100%.

## How to play

- Move with WASD or arrow keys.
- Press E to grab loot when you are close to it.
- Press Q to puff smoke ($25 of score, 2 charges). Smoke hides you from guards and cameras.
- Break line of sight behind shelves, desks, crates or the central pillar and the alarm falls.
- Grab the vault core, then reach the green exit to win. Get caught and the run ends.
- Press R to try again after a caught run or a clean getaway.

## What is inside

- game/src/config.js - the level: walls, guard patrols, camera arcs, loot and tuning.
- game/src/input.js - keyboard and mouse state.
- game/src/sound.js - WebAudio synth beeps, no audio files.
- game/src/sight.js - line of sight: cones, cover and smoke.
- game/src/guards.js - guard patrols and spotting.
- game/src/cameras.js - sweeping wall cameras and spotting.
- game/src/loot.js - loot items and grabbing.
- game/src/alarm.js - the alarm meter.
- game/src/render.js - all canvas drawing, HUD and screens.
- game/src/main.js - game loop, state machine and screenshot staging.

All art is drawn procedurally on canvas 2D. All sounds are synthesised. No network requests, no third-party assets, no copied names or levels.
