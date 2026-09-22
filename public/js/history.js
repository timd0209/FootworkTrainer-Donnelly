import{load,addWorkout,save}from"./storage.js";import{calculateStats}from"./streaks.js";
export function recordWorkout(w){const data=addWorkout(w);const stats=calculateStats(data);if(stats.longestStreak>(data.longestStreak||0)){data.longestStreak=stats.longestStreak;save(data)}return calculateStats(data)}
export function getHistory(){return load().workouts}
export function getStats(){return calculateStats(load())}
