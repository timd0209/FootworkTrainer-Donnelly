const KEY="happyFeetFootwork.v1";
export function load(){try{return JSON.parse(localStorage.getItem(KEY))||{workouts:[],longestStreak:0}}catch{return{workouts:[],longestStreak:0}}}
export function save(data){localStorage.setItem(KEY,JSON.stringify(data))}
export function addWorkout(workout){const data=load();if(data.workouts.some(w=>w.id===workout.id))return data;data.workouts.unshift(workout);data.workouts=data.workouts.slice(0,100);save(data);return data}
