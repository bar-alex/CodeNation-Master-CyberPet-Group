// returns a log function pre-configured with the variables given to this function


const _sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
const _delayWrite = async (s, delay, randomized, rewriteLine) => {
    // rewrite lne
    // \x1b[0G
    //if(rewriteLine)
        //process.stdout.write("\r\x1b[K\r")
    //process.stdout.write("\x1b[0G\x1b[K\x1b[0G")
    process.stdout.write("\x1b[0G\x1b[K")
    // typewrite or line write
    if(delay>0)
        for (const c of s) {
            process.stdout.write(c);
            await _sleep((randomized ? Math.random() : 1) * delay);
        }
    else 
        process.stdout.write(s);
    // new line
    if(!rewriteLine) 
        process.stdout.write('\n');
        
}

const _screenWrite = async (rewriteLine, ...args) => {
    // rewrite lne
    // \x1b[0G
    //if(rewriteLine)
        //process.stdout.write("\r\x1b[K\r")
    //process.stdout.write("\x1b[0G\x1b[K\x1b[0G")
    process.stdout.write("\x1b[0G\x1b[K")
    // typewrite or line write
    // console.log('params: ', args );
    for(let s of args){
        if( typeof s != 'string' ) 
            s = s.toString();
        process.stdout.write(s+' ');
    }
    // new line
    if(!rewriteLine) 
        process.stdout.write('\n');
        
}


const typewriteLog = ( delay = 100, randomized = true ) => (s) => { _delayWrite(s, delay, randomized, false) }

const customLog = () => (...args) => { _screenWrite(false, ...args) }

const rewriteLog = () => (...args) => { _screenWrite(true, ...args) }


module.exports = { customLog, rewriteLog }
