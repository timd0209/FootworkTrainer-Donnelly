# Happy Feet Footwork

**By Tim Donnelly**

Happy Feet Footwork is a browser-based solo wrestling training app. It acts like a virtual practice partner: the athlete chooses a round structure, starts the workout, and hears unpredictable wrestling commands such as **Shot**, **Sprawl**, **Downblock**, **Circle**, **Fast Feet**, **Level Change**, and **Reset**.

## MVP goals
- Mobile-first workout setup and active workout screen
- Accurate work/rest rounds
- Randomized spoken commands only during work periods
- Beginner, Intermediate, Advanced, and Custom intensity
- Workout summaries and history
- Daily streaks and basic statistics
- Technique/video library with replaceable placeholder content

## Technology
The first version uses plain HTML, CSS, and JavaScript and is deployed with Cloudflare Workers static assets. Workout data is stored in `localStorage`, which means the browser saves it on that device without requiring an account.

## Product principle
Reliability comes before visual extras. The core experience is: **press Start, get in stance, and react to a virtual coach.**

See `ProductSpec.md` for product behavior and `FEATUREROADMAP_workplan.md` for the implementation order.
