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

// this holds information for the game, the milliseconds for a tick and how many ticks until it drops each stat
const gameRecord = {
    realtimeTick: 500,     // how much realtime is for a tick -- affects the 'speed' of the game
    ticksEnergy:    10,     // in how many ticks does the energy drop 1 point
    ticksHunger:     3,     // in how many ticks does the hunger drop 1 point
    ticksFitness:   30,     // fitness is affected less
    ticksAttention:  5,     // in how many ticks does it crave attention
};


// the base class
class Creature{
    constructor(name){
        this._name      = name;

        // the stats of the creature
        this._energy    = 100;
        this._hunger    = 100; 
        this._fitness   = 100;
        this._attention = 100;
        //this._happiness = 100;

        // keeps track of how many ticks since last energy hit // same with the other stats
        // - every system tick, this increases, until it reaches gameRecord.ticksEnergy
        // - them it drains the stat and in resets this counter
        this._ticks_energy      = 0; 
        this._ticks_hunger      = 0; 
        this._ticks_fitness     = 0; 
        this._ticks_attention   = 0;
    }
    // properties (getters)
    get name(){ 
        return this._name; 
    }
    get energy(){ 
        return this._energy; 
    }
    get hunger(){ 
        return this._hunger; 
    }
    get fitness(){ 
        return this._fitness; 
    }
    get attention(){ 
        return this._attention; 
    }
    get happiness(){ 
        // overall happiness compounded from all the other stats
        return Math.ceil( (this._energy + this._hunger + this._fitness + this._attention)/4 );
    }

    // have the creature go to sleep - energy replenishes (by default - with 1 point)
    doSleep(amount = 1){
        this.statReplenish('energy',amount);
    }
    doFeed(amount = 1){
        this.statReplenish('hunger',amount);
    }
    doExercise(amount = 1){
        this.statReplenish('fitness',amount);
    }
    doPet(amount = 1){
        this.statReplenish('attention',amount);
    }
    doPlayWith(){
        // 2do: could use function that gets the creature object as a param and 
        // the function will affect the stats with statDrain(), starReplenish() 
        // then use playEffect() to show a message
    }
    // at random times, the creature might do something - add some spice, the game loop might get the creature to do something random
    // evtRandomAction(){
    //     // todo: can do a crazy weird random action, will be called by the loop system, will display a message with playEffect() and maybe affect some stats
    // }
    // message, animation, whatever is needed
    playEffect(message){
        console.log(`> ${message}`);
    }

    // will drain a stat - executed in accordance to certain condition: hunger, energy, fitness, attention
    statDrain(statName, value=1){
        const propName = '_'+statName;
        this[propName] = Math.max( 0, this[propName] - value);       // is an object, so using "this['_energy']" == "this._energy"
    }
    // will replenish a stat 
    statReplenish(statName, value=1){
        const propName = '_'+statName;
        this[propName] = Math.min( 100, this[propName] + value);    // can't go over 100, or below 0
    }
    // every system tick this is called -- will drain the stats ikn accordance with "this._ticks_stat" and "gameRecord.ticksStat"
    evtSystemTick(){
        let changeWasMade = false;
        // increase all the ticks
        this._ticks_energy++;
        this._ticks_hunger++;
        this._ticks_fitness++;
        this._ticks_attention++;
        // if the ticks have reached the max for the stat then drain the stat
        if( this._ticks_energy >= gameRecord.ticksEnergy ){
            this.statDrain('energy');
            this._ticks_energy=0;
            changeWasMade = true;
        }
        if( this._ticks_hunger >= gameRecord.ticksHunger ){
            this.statDrain('hunger');
            this._ticks_hunger=0;
            changeWasMade = true;
        }
        if( this._ticks_fitness >= gameRecord.ticksFitness ){
            this.statDrain('fitness');
            this._ticks_fitness=0;
            changeWasMade = true;
        }
        if( this._ticks_attention >= gameRecord.ticksAttention ){
            this.statDrain('attention');
            this._ticks_attention=0;
            changeWasMade = true;
        }
        // if change was made, display the stats
        if(changeWasMade){
            const text = `${this._name}'s stats: `+
                `Energy: ${this.energy.toString().padStart(3)} `+
                ` | Hunger: ${this.hunger.toString().padStart(3)}`+
                ` | Fitness: ${this.fitness.toString().padStart(3)}`+
                ` | Attention: ${this.attention.toString().padStart(3)}`+
                ` | overall happiness ${this.happiness.toString().padStart(3)}`;
            this.playEffect(text);
        }
    }
}



// -------------------------------------------------
// game loop example

const doggy = new Creature("Mike");

let tick = 0;
const intervalId = setInterval(() => {
    tick++ ;
    console.log('tick: '+tick);
    // 
    doggy.evtSystemTick()

    // 
    if(tick>=300) clearInterval(intervalId);
}, gameRecord.realtimeTick);