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
            fs.writeFileSync('./.tig/exclude.txt',
             '# Writte here files or pattern to exclude\n# line starting with # are comments',
              err => console.error(err));
    }
}


module.exports = {init}