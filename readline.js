async function getInput(question, onAnswer) {
    let readline = require('readline');
  
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question(question, function (x) {
          // var aString = parseInt(x);
          let aString = x;
          rl.close();
          // entered = true;
          return resolve(aString);
        });
      });

  }
  
  async function getInputFromSelection( 
          cTextToDisplay="Choice: ", 
          commaSeparatedChoices, 
          defaultChoice=commaSeparatedChoices.split(',')[0], 
          returnTheIndex=false, 
          functionToRunOnAnswer) {

    let i = 0;
    let answer;
    while (i <= 10 && answer!=99) {
      answer = await getInput(cTextToDisplay);
      // answer = await getInput("Enter something: ");

      // console.log(answer);
      i++;
      // console.log('a',i);

      const searchFor = answer.toLowerCase().trim();
      const searchedIn = commaSeparatedChoices.toLowerCase().split(',');
      if ( searchedIn.indexOf( searchFor )>-1) 
          return ( returnTheIndex ? searchedIn.indexOf( searchFor ) : answer );

    }
  }

  // mainTestReadLine();

module.exports = { getInputFromSelection, getInput }




// function getInput(question) {
//   var readline = require('readline');

//   var rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//   });

//   return new Promise((resolve, reject) => {
//       rl.question(question, function (x) {
//         var aString = parseInt(x);
//         rl.close();
//         entered = true;
//         return resolve(aString);
//       });
//     });

// }

// async function mainTestReadLine() {
//   var i = 0;
//   var myGuess;
//   while (i <= 20 && myGuess!=99) {
//     myGuess = await getInput("Enter something: ");
//     // myGuess = getInput("Enter something: ");
//     console.log(myGuess);
//     i++;
//     console.log('a',i);
//   }
// }

// mainTestReadLine();