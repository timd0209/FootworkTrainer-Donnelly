let audioContext=null;
function getAudioContext(){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;if(!audioContext)audioContext=new Ctx();return audioContext}
function tone(frequency,duration=.14,volume=.5,type="sine",delay=0){const ctx=getAudioContext();if(!ctx||ctx.state!=="running")return;const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+delay;oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+duration)}
export async function unlockAudio(){const ctx=getAudioContext();if(!ctx)return false;try{if(ctx.state==="suspended")await ctx.resume();const buffer=ctx.createBuffer(1,1,22050),source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);source.start(0);return ctx.state==="running"}catch{return false}}
export function countdownBeep(){tone(740,.12,.5,"square")}
export function workBeep(){tone(1040,.16,.55,"square");tone(1320,.18,.5,"square",.18)}
export function restBeep(){tone(620,.18,.55,"square");tone(440,.24,.5,"square",.2)}
export function completeBeep(){tone(880,.13,.5,"sine");tone(1100,.13,.5,"sine",.15);tone(1320,.24,.5,"sine",.3)}
export function speak(text){cancelSpeech();if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=1.15;u.pitch=.85;u.volume=1;window.speechSynthesis.speak(u)}
export function cancelSpeech(){if("speechSynthesis" in window)window.speechSynthesis.cancel()}
