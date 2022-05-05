function getInput(question) {
    var readline = require('readline');
  
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question(question, function (x) {
          var aString = parseInt(x);
          rl.close();
          entered = true;
          return resolve(aString);
        });
      });


    // rl.question(question, function (x) {
    //   var aString = parseInt(x);
    //   rl.close();
    //   entered = true;
    //   return aString;
    // });
  
  }
  
  async function main() {
    var i = 0;
    var myGuess;
    while (i <= 20 && myGuess!=99) {
      myGuess = await getInput("Enter something: ");
      console.log(myGuess);
      i++;
      console.log('a',i);
    }
  }
  
  main();

