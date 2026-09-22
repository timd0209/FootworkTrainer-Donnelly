# Happy Feet Footwork — Product Specification

## Product vision
Happy Feet Footwork helps wrestlers improve stance, motion, reactions, conditioning, and consistency when practicing alone.

## Primary user
The first user is a wrestler who wants structured stance-and-motion practice outside team practice and may not have a coach or partner available.

## Core workout
The athlete configures:
- number of rounds
- work duration per round
- rest duration
- intensity: Beginner, Intermediate, Advanced, or Custom

After Start, the app runs a short countdown and then alternates work and rest periods. During work only, it speaks randomized commands: Shot, Sprawl, Downblock, Circle, Fast Feet, Level Change, and Reset.

Intensity changes the range of time between commands. Randomization prevents the athlete from anticipating the next movement.

## Active workout screen
Show the current round, total rounds, remaining time, WORK/REST state, current command, and upcoming rest. The timer and command must be readable from several feet away.

Controls: Pause, Resume, and End Workout.

## Reliability requirements
- Commands never play during rest.
- Only one workout timer can run.
- Ending a workout stops timing and speech.
- A completed workout is saved only once.
- Timing uses real elapsed time so switching tabs does not make the clock drift.
- Refresh/reopen cannot incorrectly increase streaks.

## Audio
Version 1 uses the browser Speech Synthesis API (built-in text-to-speech). The audio module must have one clear interface so recorded coach audio can replace synthetic speech later.

## Presets
- Beginner: slower, more recovery between commands.
- Intermediate: moderate and unpredictable.
- Advanced: frequent commands and greater conditioning demand.
- Custom: athlete controls workout settings.

Exact command-frequency ranges should live in configuration, not be hard-coded throughout the app.

## Completion and history
A completed workout summary includes duration, rounds, active training time, command count, and current streak. Store workout records locally.

## Accountability
Track current streak, longest streak, workouts completed, total rounds, total training minutes, and last workout date. One qualifying completed workout per local calendar day maintains the streak. Milestones: 3, 7, 14, 30 days and 50/100 workouts.

## Technique library
Categories: Stance & Motion, Shots, Defense, Footwork, Drills. Each item contains a title, description, replaceable video placeholder, coaching points, and common mistakes.

## Design
Mobile-first, athletic, uncluttered, high contrast, bold type, large touch targets. During training, the timer and current command dominate the screen.

## Version 1 exclusions
No accounts, social feed, messaging, live coaching, AI technique analysis, camera tracking, team/coach dashboards, subscriptions, leaderboards, or wearables.

## Technical architecture
Plain HTML/CSS/JavaScript. Separate JavaScript modules for workout timing, command generation, audio, streaks, history, techniques, and UI. Use browser `localStorage` for version 1 persistence.

Cloudflare Workers serves static assets using `wrangler.jsonc`; observability is enabled and the compatibility date matches the project setup date.

## Definition of MVP done
A wrestler can open the deployed site on mobile or desktop, configure a workout, complete accurate work/rest rounds with randomized spoken commands, receive a summary, see saved history/stats/streaks, and browse technique content.
