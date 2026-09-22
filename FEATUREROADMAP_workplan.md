# Happy Feet Footwork — Feature Roadmap / Work Plan

Each checkbox is one implementation task. **Dependency** means what must already work. **Definition of done** means the test that proves the task is complete.

## Phase 0 — Foundation
- [x] **Product documentation**
  - Dependencies: none
  - Files: README.md, ProductSpec.md, FEATUREROADMAP_workplan.md
  - Build: document product, architecture, scope, and ordered work
  - Definition of done: all three documents exist and agree on MVP behavior

- [ ] **Project skeleton + Cloudflare configuration**
  - Dependencies: documentation
  - Files: wrangler.jsonc, public/index.html, public/css/styles.css, public/js/*
  - Build: static app structure and Cloudflare Workers asset configuration
  - Definition of done: a basic Happy Feet page runs locally and can be deployed

## Phase 1 — Core workout
- [ ] **Basic mobile interface**
  - Dependencies: project skeleton
  - Files: public/index.html, public/css/styles.css, public/js/ui.js
  - Build: home/setup and active-workout layouts with large touch targets
  - Definition of done: layouts work at phone and desktop widths

- [ ] **Workout timer engine**
  - Dependencies: project skeleton
  - Files: public/js/workout-engine.js, tests/workout-engine.test.js
  - Build: countdown and elapsed-time-based timer with start/pause/resume/end
  - Definition of done: automated tests show no duplicate timers and accurate transitions

- [ ] **Work/rest round transitions**
  - Dependencies: workout timer engine
  - Files: public/js/workout-engine.js, tests/workout-engine.test.js
  - Build: alternate configured work/rest periods and finish after final work round
  - Definition of done: representative multi-round workouts transition exactly once per phase

- [ ] **Random command system**
  - Dependencies: work/rest transitions
  - Files: public/js/commands.js, tests/commands.test.js
  - Build: unpredictable commands scheduled only in WORK state
  - Definition of done: tests prove commands stop in REST, PAUSED, COMPLETE, and ENDED states

- [ ] **Audio command system**
  - Dependencies: random command system
  - Files: public/js/audio.js
  - Build: speak commands through browser speech synthesis behind a replaceable audio interface
  - Definition of done: commands are audible on supported browsers and speech cancels immediately on pause/rest/end

- [ ] **Custom workout configuration**
  - Dependencies: timer + UI
  - Files: public/index.html, public/js/ui.js, public/js/config.js
  - Build: controls for rounds, work duration, rest duration, and custom intensity
  - Definition of done: selected values drive the workout and invalid values cannot start one

- [ ] **Preset intensity levels**
  - Dependencies: command system
  - Files: public/js/config.js, public/js/commands.js
  - Build: Beginner, Intermediate, and Advanced command-frequency presets
  - Definition of done: each preset uses its configured frequency range and Custom remains editable

- [ ] **Deploy core workout**
  - Dependencies: all Phase 1 tasks
  - Files: wrangler.jsonc
  - Build: deploy the reliable core experience to Cloudflare
  - Definition of done: public URL completes a full workout on mobile and desktop

## Phase 2 — Retention
- [ ] **Completed-workout summary**
  - Dependencies: deployed core workout
  - Files: public/js/ui.js
  - Build: duration, rounds, active minutes, command count
  - Definition of done: summary matches the completed workout

- [ ] **Workout history**
  - Dependencies: summary
  - Files: public/js/history.js, public/js/storage.js
  - Build: save and display completed workouts using localStorage
  - Definition of done: history survives refresh and a workout cannot be saved twice

- [ ] **Streak/accountability system**
  - Dependencies: history
  - Files: public/js/streaks.js, public/js/storage.js
  - Build: current/longest streak, last workout date, milestones
  - Definition of done: same-day workouts do not double-increment; consecutive/missed-day cases pass tests

- [ ] **Technique/video library**
  - Dependencies: core deployed
  - Files: public/js/techniques.js, public/index.html
  - Build: categorized placeholder instructional content with coaching points/common mistakes
  - Definition of done: categories can be browsed and content/video references are easy to replace

- [ ] **Statistics dashboard**
  - Dependencies: history + streaks
  - Files: public/js/stats.js, public/js/ui.js
  - Build: workouts, rounds, training minutes, current/longest streak
  - Definition of done: statistics are derived correctly from saved data

## Phase 3 — Finish
- [ ] **Visual polish + mobile optimization**
  - Dependencies: feature-complete app
  - Files: public/css/styles.css
  - Build: serious athletic design, dominant active timer/command, responsive layouts
  - Definition of done: no overflow or unusable controls at common phone/desktop widths

- [ ] **Accessibility + testing**
  - Dependencies: feature-complete app
  - Files: app files + tests
  - Build: semantic controls, keyboard support, visible focus, reduced-motion consideration, contrast, regression tests
  - Definition of done: core workout is keyboard usable and automated tests pass

- [ ] **Production deployment**
  - Dependencies: all prior tasks
  - Files: wrangler.jsonc, README.md
  - Build: final Cloudflare deployment and deployment documentation
  - Definition of done: production URL works and README contains run/deploy instructions

## Git workflow
Complete tasks in order. Commit each completed checkbox with a descriptive message and push it. Use feature branches and pull requests for major milestones. Never force-push.
