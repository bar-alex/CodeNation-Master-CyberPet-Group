
const captureKey = (handleKey) => {
    const readline = require('readline');

    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.emitKeypressEvents(process.stdin, rl);
    // console.log(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', handleKey);
    // console.log('captureKey ',handleKey);
    return rl
}

module.exports = { captureKey }
