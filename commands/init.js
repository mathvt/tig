const fs = require('fs');

function init(){
    if(fs.existsSync('./.tig/')){
        console.log('Project already initialised');
    }
    else{
            fs.mkdirSync('./.tig');
            fs.mkdirSync('./.tig/object');
            fs.writeFileSync('./.tig/head', 'main', err => console.error(err));
            fs.writeFileSync('./.tig/exclude.txt',
             '# Writte here files or pattern to exclude\n# line starting with # are comments',
              err => console.error(err));
    }
}


module.exports = {init}