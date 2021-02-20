const fs = require('fs');
const { readfullpath, read, readTree } = require('../myFunctions');


function status(){
    if(!fs.existsSync('./.tig')){
        return console.log('project not initialized');
    }
    let branch = read('./.tig/branch.txt');
    console.log('On branch '+branch);
    
}