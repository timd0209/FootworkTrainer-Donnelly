import{COMMANDS}from"./config.js";
const COMBINATIONS=[
 ["Fake","Shot"],
 ["Circle right","Level change","Shot"],
 ["Downblock","Circle left","Shot"],
 ["Sprawl","Snap down","Circle right"],
 ["Level change","Fake","Shot"],
 ["Downblock","Circle right","Shot"],
 ["Sprawl","Circle left","Shot"]
];
export class CommandGenerator{
 constructor({minDelay,maxDelay,onCommand,combinationChance=0,maxCombinationLength=1,combinationMoveDelay=1.15}){this.minDelay=minDelay;this.maxDelay=maxDelay;this.onCommand=onCommand;this.combinationChance=combinationChance;this.maxCombinationLength=maxCombinationLength;this.combinationMoveDelay=combinationMoveDelay;this.timeout=null;this.sequenceTimeout=null;this.active=false;this.last=null}
 start(){this.stop();this.active=true;this.schedule()}
 schedule(){if(!this.active)return;const delay=(this.minDelay+Math.random()*(this.maxDelay-this.minDelay))*1000;this.timeout=setTimeout(()=>{if(!this.active)return;let moves;if(this.maxCombinationLength>1&&Math.random()<this.combinationChance){const eligible=COMBINATIONS.filter(c=>c.length<=this.maxCombinationLength&&c.join("|")!==this.last);moves=eligible[Math.floor(Math.random()*eligible.length)]||[COMMANDS[Math.floor(Math.random()*COMMANDS.length)]]}else{const choices=COMMANDS.filter(x=>x!==this.last);moves=[choices[Math.floor(Math.random()*choices.length)]]}this.last=moves.length>1?moves.join("|"):moves[0];this.deliverMoves(moves,0)},delay)}
 deliverMoves(moves,index){if(!this.active)return;if(index>=moves.length){this.schedule();return}this.onCommand({move:moves[index],sequenceLength:moves.length,sequenceIndex:index});if(index<moves.length-1){this.sequenceTimeout=setTimeout(()=>this.deliverMoves(moves,index+1),this.combinationMoveDelay*1000)}else this.schedule()}
 stop(){this.active=false;if(this.timeout)clearTimeout(this.timeout);if(this.sequenceTimeout)clearTimeout(this.sequenceTimeout);this.timeout=null;this.sequenceTimeout=null}
}
