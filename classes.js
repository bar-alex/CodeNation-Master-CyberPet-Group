// the available actions could be in a list of objects {text, function (anonymous) to run, array of parameters}


//-------------------------------------------------------------------------
// holds config variables for the game
const gameRecord = {
    realtimeTick:  300,     // how much realtime is for a tick -- affects the 'speed' of the game
    ticksEnergy:     5,     // in how many ticks does the energy drop 1 point
    ticksHunger:     3,     // in how many ticks does the hunger drop 1 point
    ticksFitness:   10,     // fitness is affected less
    ticksAttention:  5,     // in how many ticks does it crave attention
};


//-------------------------------------------------------------------------
// the base class - defines the basic structure of the creature
class Creature{
    constructor(name, logFunction, creatureType){
        // console.log('params: ', name, logFunction);
        this._type      = creatureType;
        this._name      = name;
        this._logText   = (typeof logFunction == 'function' ? logFunction : console.log);

        this._activity  = ''    // if ti has an extra activity, the method name will pe be placed here

        // the stats of the creature
        this._energy    = 100;
        this._hunger    = 100; 
        this._fitness   = 100;
        this._attention = 100;
        //this._happiness = 100;    // it will be compounded from all the others

        // these are counters to keep track how may ticks happened since last drop in the respective stats
        // with every tick they will increase until they reach the config value, at which point the stat will drop one point and these will reset
        this._ticks_energy      = 0; 
        this._ticks_hunger      = 0; 
        this._ticks_fitness     = 0; 
        this._ticks_attention   = 0;
    }

    // properties (getters) -- interface to retrieve the values of the stats
    // the stats are: energy, hunger, fitness, attention
    get name        (){ return this._name; }
    // overall happiness compounded from all the other stats
    get happiness   (){ return Math.ceil( (this._energy + this._hunger + this._fitness + this._attention)/4 ); }
    
    // will return the stat value passed as a parameter
    getStat(stat) {
        const propName = '_'+stat;
        return this[propName];
    }

    // have the creature go to sleep - energy replenishes (by default - with 1 point)
    doRest (amount = 1){ 
        this.statGain('energy',amount); 
        this.playEffect('message',`With a soft lullaby, you send ${this.name} into the land of dreams. (${amount} energy was gained)`);
    }
    doFeed (amount = 1){ 
        this.statGain('hunger',amount); 
        this.playEffect('message',`You give ${this.name} a hearty meal. The look in it's eyes melts your heart. (${amount} points were replenished)`);
    }
    doExercise (amount = 1){ 
        this.statGain('fitness',amount); 
        this.playEffect('message',`Some exercising will do ${this.name} real good, despite it's vehement objections. (${amount} points were gained)`);
    }
    doPet (amount = 1){ 
        this.statGain('attention',amount); 
        this.playEffect('message',`Spending quality time together is good for both of you and ${this.name} is happy for the attention. (${amount} points were gained)`);
    }
    
    // if it has an extra activity, it can run this
    hasActivity(){ return (typeof this[ this._activity ] === 'function') };

    doActivity(){ this[ this._activity ]() };

    // random chance to be called every tick - the creature might do something cute every now and then, at random
    // will be called from this.evtSystemTick() at random 
    doRandomAction(){
        // ex: this.playEffect('message',`-> <*> Suddenly, ${this.name} starts break-dancing!`);
    }
    
    // message, animation, whatever feedback is needed to show
    // type specifies the type of the change, message is the message received
    playEffect(type,param){
        if(type=='message' || type=='stats')
            this._logText(`-> ${param}`);
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

    // will send a message with all the stats of the creature
    showStats(){
        const text = `${this.name}'s stats: `+
            `Energy: ${this._energy.toString().padStart(3)} `+
            ` | Hunger: ${this._hunger.toString().padStart(3)}`+
            ` | Fitness: ${this._fitness.toString().padStart(3)}`+
            ` | Attention: ${this._attention.toString().padStart(3)}`+
            ` | overall happiness ${this.happiness.toString().padStart(3)}`;
        this.playEffect('stats',text);
    }

    // on every tick it will increase the _tickStat, then check if it will decrease the actual stat
    // will return true if the actual stat was decreased
    _tickOnStat(stat){
        let [ statTick, maxTickStat ] = [ '_ticks_'+stat, 'ticks'+stat[0].toUpperCase()+stat.slice(1) ];
        this[statTick]++;   // increase the stat tick
        // if the ticks are higher then the amount of ticks 
        if( this[statTick] >= gameRecord[maxTickStat] ) {
            this.statDrain(stat);
            this[statTick] = 0;
            // change was made to the actual stat
            return true;
        }
        // no change was made to the actual stat
        return false;
    }

    // these function will output a different message for different levels of the respective stat
    complainEnergy(){
        let complainText =
            this._energy<10 ? `exhausted, like, nearly dead!` :
            this._energy<30 ? `falling asleep on it's feet now *hint* *hint*\n` :
            this._energy<50 ? `tired, sleep is needed.` :
            this._energy<50 ? `in need of some rest.` :
            this._energy<80 ? `looking a bit tired, but it's ok.` : '';
        if(complainText)
            this.playEffect('message', `${this.name} is `+ complainText);
    }

    complainHunger(){
        let complainText =
            this._hunger<10 ? `nearly dead with hunger, you monster!!\n` :
            this._hunger<30 ? 'famished, have you never heard of animal cruelty??\n' :
            this._hunger<50 ? `looking at you funny, you notice that it's also drooling.\n` :
            this._hunger<60 ? `really hungry, that's all it thinks about.` :
            this._hunger<70 ? `hungry, it needs some food.` : 
            this._hunger<90 ? `feeling a bit peckish.` : '';
        if(complainText)
            this.playEffect('message', `${this.name} is `+ complainText);
    }

    complainFitness(){
        let complainText =
            this._fitness<10 ? `basically moving by rolling around at this point!` :
            this._fitness<30 ? `indistinguishable from it's environment, that's how long it's been since it last moved.\n` :
            this._fitness<50 ? `getting dangerously obese.` :
            this._fitness<70 ? `definitely getting fat.` :
            this._fitness<90 ? `getting a bit fluffy, but it's nothing that a little exercise won't fix.\n` : '';
        if(complainText)
            this.playEffect('message', `${this.name} is `+ complainText);
    }

    complainAttention(){
        let complainText =
            this._attention<10 ? `completely feral now! It doesn't even know who you are.\n` :
            this._attention<30 ? `nearly wild again, he kinda remembers you, but it's unsure if you were ever real or a dream.\n` :
            this._attention<60 ? `missing you terrible, really sad, where are you?\n` :
            this._attention<90 ? `feeling a bit neglected.` : '';
        if(complainText)
            this.playEffect('message', `${this.name} is `+ complainText);
    }


    // every system tick this is called -- will drain the stats ikn accordance with "this._ticks_stat" and "gameRecord.ticksStat"
    evtSystemTick(){

        if( this._tickOnStat('energy') && this.getStat('energy')%10==0 )
            this.complainEnergy()
        
        if( this._tickOnStat('hunger') && this.getStat('hunger')%10==0 )
            this.complainHunger()

        if( this._tickOnStat('fitness') && this.getStat('fitness')%10==0 )
            this.complainFitness()

        if( this._tickOnStat('attention') && this.getStat('attention')%10==0 )
            this.complainAttention()

        // randomly, execute the doRandomAction 
        const randNumber = Math.ceil(Math.random()*100);
        if( randNumber==42 )
            this.doRandomAction();
    }
    // do something when stats change, show them, update visuals, etc
}


// subclass ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class Dog extends Creature{
    constructor(name, logFunction){
        super(name,logFunction, 'dog');

        // console.log( this );

        this._activity = 'playFetch';

        // fot the spamming of fetch functionality
        this._fetch_before_spam = 10;   // if oyu play fetch with him within 3 ticks then you're spamming him
        this._ticks_since_fetch = this._fetch_before_spam+1 ;   // how many ticks since last fetch
        this._every_x_ticks = 0;       // counts until 5 ticks
    }

    // custom activity for this class
    playFetch(){
        if( this._ticks_since_fetch > this._fetch_before_spam){
            // happy to play fetch, as its been a while
            this.playEffect('message', `${this.name} is happy because you decided to play fetch with him.`);
            //this.playEffect('refresh-stat', "energy")
            this.statGain('fitness',3);         // gets exercise, get fit
            this.statDrain('energy',2);         // gets tired of all the running
            this.statGain('attention',5);        // gets lots of attention
        } else {
            // nat so happy to play fetch you've done it pretty recently -- you're fetch-spamming him
            this.playEffect('message', `${this.name} is happy to play fetch, but he's a bit tired`);
            //this.playEffect('refresh-stat', "energy")
            this.statGain('fitness',2);         // gets exercise, get fit
            this.statDrain('energy',5);         // gets tired of all the running
            this.statGain('attention',2);        // gets lots of attention
        }
        // reset this
        this._ticks_since_fetch = 0;
    }

    // random thing me might do now and then
    doRandomAction(){
        this.playEffect('message', `${this.name} spent some minutes frantically chasing his own tail. That must have burned some calories for sure.\n`);
        this.statGain('fitness',10);
        this.statDrain('energy',3);
        this.statDrain('hunger',3)
    }


    evtSystemTick(){
        this._ticks_since_fetch++;
        super.evtSystemTick();
    }
}


class Cat extends Creature{
    constructor(name, logFunction){
        super(name,logFunction, 'cat');

        this._activity = 'playLaserPointer';
    }

    // random thing me might do now and then
    doRandomAction(){
        this.playEffect('message', `${super.name} curled into your lap and started purring away.\n`);
        this.statGain('energy',10);
        this.statGain('attention',5);
        this.statDrain('hunger',1);
        this.statDrain('fitness',1);
    }

    // custom action for this class
    playLaserPointer(){
        this.playEffect('message', `${super.name} is jumping around trying to catch your laser pointer.\n`);
        this.statGain('attention',10);
        this.statGain('fitness',5);
        this.statDrain('energy',3);
        this.statDrain('hunger',1);
    }

}


class Lizard extends Creature{
    constructor(name, logFunction){
        super(name,logFunction, 'lizard');
    }

    doRandomAction(){
        this.playEffect('message', `${this.name} is to cool to do anything, it just sits there, silently judging you.\n`);
        this.statDrain('fitness',1);
        this.statGain('attention',5)
    }
}



module.exports = {
    gameRecord, 
    Creature,
    Dog,
    Cat,
    Lizard,
};

