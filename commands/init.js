const fs = require('fs');

function init(){
    if(fs.existsSync('./.tig/')){                         // TODO : allow some files to be ignored
        console.log('Project already initialised');
    }
    else{
            fs.mkdirSync('./.tig');
            fs.mkdirSync('./.tig/stage');
            fs.mkdirSync('./.tig/data');
    }
}


module.exports = {init}