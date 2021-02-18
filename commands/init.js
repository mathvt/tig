const fs = require('fs');

function init(){
    if(fs.existsSync('./.tig/')){                         // TODO : allow some files to be ignored
        console.log('Project already initialised');
    }
    else{
            fs.mkdirSync('./.tig');
            fs.mkdirSync('./.tig/stage');
            fs.mkdirSync('./.tig/data');
            fs.writeFileSync('./.tig/branch.txt', 'main', err => console.error(err));
    }
}


module.exports = {init}