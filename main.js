// the game will have a loop that will execute every amount of time,
// the 'tick' is every pass of the loop - its a unit of time for the game
// 
// every few ticks the creature gets a bit more tired, a bit more hungry, etc
// in the game, that is reflected as a drain in the stats
//
// of course, the stats don't drain at the same speed, you need to eat 3 times a day, but need to sleep only once
// in the gameRecord object i have the number of ticks until teh respective stat drops 1 point
// 
// in the creature class, there is a record of how many ticks passed since last drop of the stat
// when it reaches the amount of ticks specified in gameRecord, then it will drop the stat



// ----------------------------------------------------------

const { Creature, Dog, gameRecord } = require('./classes');





// -------------------------------------------------
// game loop example

//const crit = new Creature("Mike");
const crit = new Dog("Spot");

let tick = 0;
const intervalId = setInterval(() => {
    tick++ ;
    console.log('tick: '+tick);
    // 
    crit.evtSystemTick();

    // 
    if(tick>=300) clearInterval(intervalId);
}, gameRecord.realtimeTick);

