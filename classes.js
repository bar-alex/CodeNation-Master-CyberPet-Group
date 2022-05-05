
// the game variables
// const { gameRecord } = require('./main');


const gameRecord = {
    realtimeTick:  500,     // how much realtime is for a tick -- affects the 'speed' of the game
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
        this.statGain('energy',amount);
    }
    doFeed(amount = 1){
        this.statGain('hunger',amount);
    }
    doExercise(amount = 1){
        this.statGain('fitness',amount);
    }
    doPet(amount = 1){
        this.statGain('attention',amount);
    }
    doPlayWith(){
        // 2do: could use function that gets the creature object as a param and 
        // the function will affect the stats with statDrain(), starReplenish() 
        // then use playEffect() to show a message
    }

    // at random times, the creature might do something cute, like a random action or effect 
    // will be run from this.evtSystemTick() on a random basis
    doRandomAction(){
        this.playEffect('message',`(*) Suddenly, ${this.name} starts break-dancing!`);
    }
    // message, animation, whatever feedback is needed to show
    // type specifies the type of the change, message is the message received
    playEffect(type,param){
        if(type=='message' || type=='stats')
            console.log(`> ${param}`);
    }

    // will drain a stat - executed in accordance to certain condition: hunger, energy, fitness, attention
    statDrain(statName, value=1){
        const propName = '_'+statName;
        this[propName] = Math.max( 0, this[propName] - value);       // is an object, so using "this['_energy']" == "this._energy"
        this.playEffect(statName,'drain');
    }
    // will replenish a stat 
    statGain(statName, value=1){
        const propName = '_'+statName;
        this[propName] = Math.min( 100, this[propName] + value);    // can't go over 100, or below 0
        this.playEffect(statName,'gain');
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
            this.playEffect('stats',text);
        }
        // randomly, execute the doRandomAction 
        const randNumber = Math.ceil(Math.random()*25);
        if( randNumber==23 )
            this.doRandomAction();
    }
    // do something when stats change, show them, update visuals, etc
}


// subclass ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Dog extends Creature{
    constructor(name){
        super(name);

        // fot the spamming of fetch functionality
        this._fetch_before_spam = 10;   // if oyu play fetch with him within 3 ticks then you're spamming him
        this._ticks_since_fetch = this._fetch_before_spam+1 ;   // how many ticks since last fetch
        this._every_x_ticks = 0;       // counts until 5 ticks
    }
    playFetch(){
        if( this._ticks_since_fetch > this._fetch_before_spam){
            // happy to play fetch, as its been a while
            this.playEffect('message', `(^) ${this.name} is happy because you decided to play fetch with him.`);
            //this.playEffect('refresh-stat', "energy")
            this.statGain('fitness',3);         // gets execise, get fit
            this.statDrain('energy',2);         // gets tired of all the running
            this.statGain('attention',5);        // gets lots of attention
        } else {
            // nat so happy to play fetch you've done it pretty recently -- you're fetch-spamming him
            this.playEffect('message', `(^) ${this.name} is happy to play fetch, but he's a bit tired`);
            //this.playEffect('refresh-stat', "energy")
            this.statGain('fitness',2);         // gets execise, get fit
            this.statDrain('energy',5);         // gets tired of all the running
            this.statGain('attention',2);        // gets lots of attention
        }
        // reset this
        this._ticks_since_fetch = 0;
        // show the stats
        this.doShowStats();
    }
    evtSystemTick(){
        this._ticks_since_fetch++;
        super.evtSystemTick();

        // every 5 ticks. run this method ~~ for testing
        this._every_x_ticks++;      // increatses the test ticks
        if( this._every_x_ticks >= 10 ){
            this._every_x_ticks = 0;
            // here you run your methid
            this.playFetch();
        }

    }
    // just a method to show the stats to the screen
    doShowStats(){
        const text = `${this._name}'s stats: `+
            `Energy: ${this.energy.toString().padStart(3)} `+
            ` | Hunger: ${this.hunger.toString().padStart(3)}`+
            ` | Fitness: ${this.fitness.toString().padStart(3)}`+
            ` | Attention: ${this.attention.toString().padStart(3)}`+
            ` | overall happiness ${this.happiness.toString().padStart(3)}`;
        this.playEffect('stats',text);
    }
}




module.exports = {
    gameRecord, 
    Creature,
    Dog,
};

