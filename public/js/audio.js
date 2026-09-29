let audioContext=null;
function getAudioContext(){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;if(!audioContext)audioContext=new Ctx();return audioContext}
export function beep(){const ctx=getAudioContext();if(!ctx)return;const play=()=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;oscillator.type="sine";oscillator.frequency.setValueAtTime(880,now);gain.gain.setValueAtTime(.28,now);gain.gain.exponentialRampToValueAtTime(.001,now+.3);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(now);oscillator.stop(now+.3)};if(ctx.state==="suspended")ctx.resume().then(play).catch(()=>{});else play()}
export function speak(text){cancelSpeech();if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=1.15;u.pitch=.85;u.volume=1;window.speechSynthesis.speak(u)}
export function cancelSpeech(){if("speechSynthesis" in window)window.speechSynthesis.cancel()}
