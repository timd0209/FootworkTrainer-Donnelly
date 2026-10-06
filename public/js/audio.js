let audioContext=null;
let selectedVoice=null;
let speechUnlocked=false;
let speechGeneration=0;
let activeCommandSource=null;

const COMMAND_AUDIO={
  "shot":"/audio/commands/shot.mp3",
  "sprawl":"/audio/commands/sprawl.mp3",
  "downblock":"/audio/commands/downblock.mp3",
  "circle left":"/audio/commands/circleleft.mp3",
  "circle right":"/audio/commands/circleright.mp3",
  "fast feet":"/audio/commands/fastfeet.mp3",
  "level change":"/audio/commands/levelchange.mp3",
  "reset":"/audio/commands/reset.mp3",
  "snap down":"/audio/commands/snapdown.mp3",
  "fake":"/audio/commands/fake.mp3"
};
const commandBufferCache=new Map();
let preloadPromise=null;

function getAudioContext(){
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return null;
  if(!audioContext)audioContext=new Ctx();
  return audioContext;
}

function tone(frequency,duration=.14,volume=.5,type="sine",delay=0){
  const ctx=getAudioContext();
  if(!ctx||ctx.state!=="running")return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+delay;
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);
  oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+duration);
}

function chooseVoice(){
  if(!("speechSynthesis" in window))return null;
  const voices=window.speechSynthesis.getVoices();
  if(!voices.length)return selectedVoice;
  selectedVoice=voices.find(v=>/^en-US$/i.test(v.lang)&&v.localService)||voices.find(v=>/^en-US$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang)&&v.localService)||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;
  return selectedVoice;
}
if("speechSynthesis" in window){chooseVoice();window.speechSynthesis.addEventListener?.("voiceschanged",chooseVoice)}

async function resumeAudioContext(){
  const ctx=getAudioContext();if(!ctx)return false;
  try{if(ctx.state==="suspended")await ctx.resume();return ctx.state==="running"}catch{return false}
}

function primeSpeech(){
  if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return false;
  try{const synth=window.speechSynthesis;if(synth.paused)synth.resume();const u=new SpeechSynthesisUtterance("ready"),voice=chooseVoice();if(voice)u.voice=voice;u.lang=voice?.lang||"en-US";u.volume=.01;synth.speak(u);speechUnlocked=true;return true}catch{return false}
}

async function loadCommandBuffer(command,src){
  if(commandBufferCache.has(command))return commandBufferCache.get(command);
  const ctx=getAudioContext();if(!ctx)throw new Error("Web Audio unavailable");
  const response=await fetch(src,{cache:"force-cache"});
  if(!response.ok)throw new Error("Audio fetch failed: "+response.status);
  const bytes=await response.arrayBuffer();
  const buffer=await ctx.decodeAudioData(bytes.slice(0));
  commandBufferCache.set(command,buffer);return buffer;
}

function preloadCommandAudio(){
  if(preloadPromise)return preloadPromise;
  preloadPromise=Promise.allSettled(Object.entries(COMMAND_AUDIO).map(([command,src])=>loadCommandBuffer(command,src)));
  return preloadPromise;
}

export async function unlockAudio(){
  const contextReady=await resumeAudioContext();
  if(contextReady){
    const ctx=getAudioContext();
    try{const buffer=ctx.createBuffer(1,1,22050),source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);source.start(0)}catch{}
    preloadCommandAudio();
  }
  const speechReady=primeSpeech();
  return contextReady||speechReady;
}

export async function ensureAudioReady(){
  await resumeAudioContext();
  if("speechSynthesis" in window&&window.speechSynthesis.paused){try{window.speechSynthesis.resume()}catch{}}
}

export function countdownBeep(){tone(740,.12,.5,"square")}
export function workBeep(){tone(1040,.16,.55,"square");tone(1320,.18,.5,"square",.18)}
export function restBeep(){tone(620,.18,.55,"square");tone(440,.24,.5,"square",.2)}
export function completeBeep(){tone(880,.13,.5,"sine");tone(1100,.13,.5,"sine",.15);tone(1320,.24,.5,"sine",.3)}

function queueSpeech(text,generation){
  if(generation!==speechGeneration||!("speechSynthesis" in window))return false;
  try{const synth=window.speechSynthesis,u=new SpeechSynthesisUtterance(text),voice=chooseVoice();if(voice)u.voice=voice;u.lang=voice?.lang||"en-US";u.rate=1.15;u.pitch=.85;u.volume=1;synth.speak(u);speechUnlocked=true;return true}catch{return false}
}
function speechFallback(text){
  if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return false;
  const generation=++speechGeneration;try{const synth=window.speechSynthesis;if(synth.paused)synth.resume();synth.cancel();setTimeout(()=>queueSpeech(text,generation),60);return true}catch{return false}
}

export async function speak(text){
  const key=String(text||"").trim().toLowerCase(),src=COMMAND_AUDIO[key];
  if(!src)return speechFallback(text);
  try{
    speechGeneration++;if("speechSynthesis" in window)window.speechSynthesis.cancel();
    const ctx=getAudioContext();if(!ctx)throw new Error("Web Audio unavailable");
    if(ctx.state!=="running")await ctx.resume();
    const buffer=commandBufferCache.get(key)||await loadCommandBuffer(key,src);
    if(activeCommandSource){try{activeCommandSource.stop()}catch{}activeCommandSource=null}
    const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);source.onended=()=>{if(activeCommandSource===source)activeCommandSource=null};activeCommandSource=source;source.start(0);return true;
  }catch{return speechFallback(text)}
}

export function cancelSpeech(){
  speechGeneration++;
  if(activeCommandSource){try{activeCommandSource.stop()}catch{}activeCommandSource=null}
  if("speechSynthesis" in window){try{window.speechSynthesis.cancel()}catch{}}
}

function restoreAudioAfterVisibility(){
  if(document.visibilityState!=="visible")return;resumeAudioContext();
  if(speechUnlocked&&"speechSynthesis" in window&&window.speechSynthesis.paused){try{window.speechSynthesis.resume()}catch{}}
}
document.addEventListener("visibilitychange",restoreAudioAfterVisibility);
window.addEventListener("pageshow",restoreAudioAfterVisibility);
window.addEventListener("focus",restoreAudioAfterVisibility);
