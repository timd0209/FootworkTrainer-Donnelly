let audioContext=null;
let selectedVoice=null;
let speechUnlocked=false;
let speechGeneration=0;

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
  oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(volume,start);
  gain.gain.exponentialRampToValueAtTime(.001,start+duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start+duration);
}

function chooseVoice(){
  if(!("speechSynthesis" in window))return null;
  const voices=window.speechSynthesis.getVoices();
  if(!voices.length)return selectedVoice;
  selectedVoice=voices.find(v=>/^en-US$/i.test(v.lang)&&v.localService)||
    voices.find(v=>/^en-US$/i.test(v.lang))||
    voices.find(v=>/^en/i.test(v.lang)&&v.localService)||
    voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;
  return selectedVoice;
}

if("speechSynthesis" in window){
  chooseVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged",chooseVoice);
}

async function resumeAudioContext(){
  const ctx=getAudioContext();
  if(!ctx)return false;
  try{
    if(ctx.state==="suspended")await ctx.resume();
    return ctx.state==="running";
  }catch{return false}
}

function primeSpeech(){
  if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return false;
  try{
    const synth=window.speechSynthesis;
    synth.cancel();
    const u=new SpeechSynthesisUtterance(" ");
    const voice=chooseVoice();
    if(voice)u.voice=voice;
    u.volume=.01;
    u.rate=1;
    synth.speak(u);
    speechUnlocked=true;
    return true;
  }catch{return false}
}

export async function unlockAudio(){
  const contextReady=await resumeAudioContext();
  const speechReady=primeSpeech();
  if(contextReady){
    const ctx=getAudioContext();
    try{
      const buffer=ctx.createBuffer(1,1,22050),source=ctx.createBufferSource();
      source.buffer=buffer;
      source.connect(ctx.destination);
      source.start(0);
    }catch{}
  }
  return contextReady||speechReady;
}

export async function ensureAudioReady(){
  await resumeAudioContext();
  if("speechSynthesis" in window&&window.speechSynthesis.paused){
    try{window.speechSynthesis.resume()}catch{}
  }
}

export function countdownBeep(){tone(740,.12,.5,"square")}
export function workBeep(){tone(1040,.16,.55,"square");tone(1320,.18,.5,"square",.18)}
export function restBeep(){tone(620,.18,.55,"square");tone(440,.24,.5,"square",.2)}
export function completeBeep(){tone(880,.13,.5,"sine");tone(1100,.13,.5,"sine",.15);tone(1320,.24,.5,"sine",.3)}

export function speak(text){
  if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return false;
  const synth=window.speechSynthesis;
  const generation=++speechGeneration;
  try{
    if(synth.paused)synth.resume();
    synth.cancel();
    const u=new SpeechSynthesisUtterance(text);
    const voice=chooseVoice();
    if(voice)u.voice=voice;
    u.lang=voice?.lang||"en-US";
    u.rate=1.15;
    u.pitch=.85;
    u.volume=1;
    u.onerror=()=>{
      if(generation!==speechGeneration)return;
      setTimeout(()=>{
        if(generation!==speechGeneration)return;
        try{
          const retry=new SpeechSynthesisUtterance(text);
          const retryVoice=chooseVoice();
          if(retryVoice)retry.voice=retryVoice;
          retry.lang=retryVoice?.lang||"en-US";
          retry.rate=1.15;
          retry.pitch=.85;
          retry.volume=1;
          synth.speak(retry);
        }catch{}
      },80);
    };
    synth.speak(u);
    speechUnlocked=true;
    return true;
  }catch{return false}
}

export function cancelSpeech(){
  speechGeneration++;
  if("speechSynthesis" in window){
    try{window.speechSynthesis.cancel()}catch{}
  }
}

function restoreAudioAfterVisibility(){
  if(document.visibilityState!=="visible")return;
  resumeAudioContext();
  if(speechUnlocked&&"speechSynthesis" in window&&window.speechSynthesis.paused){
    try{window.speechSynthesis.resume()}catch{}
  }
}

document.addEventListener("visibilitychange",restoreAudioAfterVisibility);
window.addEventListener("pageshow",restoreAudioAfterVisibility);
window.addEventListener("focus",restoreAudioAfterVisibility);
