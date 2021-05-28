const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

switch(argv._[0]){
    case "sign":
        console.log('sign')
    default:
    console.log(`function not recognized`);
}