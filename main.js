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

const { gameRecord, Creature, Dog, Cat, Lizard } = require('./classes');
const { captureKey } = require('./captureKey');
// import { captureKey } from './captureKey';
const { customLog, rewriteLog } = require('./customLog');
const { getInputFromSelection, getInput } = require('./readline');


// run by captureKey // handle exiting // handle keypress: F,E,S,P, X
const handleKey = async (str,key) => {
    // log(`handling: ${str} ${key.name}`)
    if (key.ctrl && key.name === 'c') {
        process.exit();
    } else {
        switch (str.toLowerCase()) {
            case 'f': crit.doFeed(10); break;
            case 'e': crit.doExercise(10); break;
            case 'r': crit.doRest(10); break;
            case 'p': crit.doPet(10); break;
            case 's': crit.showStats(); break;

            case 'a': crit.doActivity(); break;
            case 'x': exiting = true; break;
            default: break;
        }         
    };
    pending = false;
};


// -------------------------------------------------
// game loop example

// const main = () => {

// get a log function, and one that rewrites the line
const log = customLog(0);
const logSame = rewriteLog(0);

let exiting = false;

let petType = '';
let petName = '';
let crit = null;


getInputFromSelection(`
Choose your cyber pet:
1. A doggo (a pup)
2. One mittens (kitty)
3. Lazy Larry (lizard)
0: (I just don't feel like doing it man .. )

You choice? : `
    , '1,2,3,0','0',false)
.then( (x) => { 

    // if 0 was given then quit
    if(x == 0) process.exit();

    // the choice was made, so get the type
    petType = ['dog','cat','lizard'][x-1];

    console.log();
    return getInput('Pet name:');
})
.then( (x) => {

    // the pet name was received as a param
    petName = x;

    // the crit is instantiated
    crit = 
        petType=='dog' ? new Dog(petName, log) :
        petType=='cat' ? new Cat(petName, log) :
        petType=='lizard' ? new Lizard(petName, log) :
        new Creature(petName, log, petType );

    return crit;
})
.then( () => {

    // console.log( petType, petName, crit );

    // from there the loop starts
    let tick = 0;

    // will call handleKey on all the keys that were pressed
    let rl = captureKey( handleKey );
    // console.log( rl );

    // the loop starts here
    const intervalId = setInterval(() => {
        // new tick in time loop
        tick++ ;
        // adds some space every 60 ticks
        if( tick%10==0 ) log(' ');
        // let the creature know one tick has passed ~ will do internal checks, also decrease the stats
        crit.evtSystemTick();
        // exiting condition ~ for debug, should be removed at some point
        if(exiting) {
            clearInterval(intervalId);
            // rl.Interface.close()
            log(`-> The game has ended.`)
            rl.close()
            process.exit()
        }
        //logSame( `[${tick.toString().padStart(6,' ')}]-> Input: (F)eed,(E)xercise,(R)est,(P)et, (S)tats,E(x)it => ` );
        // prints a prompt that also has the stats built into it
        logSame( `[Tick: ${tick.toString()}]-> Input: ` 
            +`[${crit.getStat('hunger').toString()}]-(F)eed, `
            +`[${crit.getStat('fitness').toString()}]-(E)xercise, `
            +`[${crit.getStat('energy').toString()}]-(R)est, `
            +`[${crit.getStat('attention').toString()}]-(P)et,  ` 
            + (crit.hasActivity() ? '(A)ctivity, ' : '')
            +`E(x)it -> ` );

    }, gameRecord.realtimeTick);


})