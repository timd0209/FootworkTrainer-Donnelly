export function speak(text){cancelSpeech();if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=1.15;u.pitch=.85;u.volume=1;window.speechSynthesis.speak(u)}
export function cancelSpeech(){if("speechSynthesis" in window)window.speechSynthesis.cancel()}
