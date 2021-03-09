const fs = require('fs');

function init(){
    if(fs.existsSync('./.tig/')){
        console.log('Project already initialised');
    }
    else{
            fs.mkdirSync('./.tig');
            fs.mkdirSync('./.tig/object');
            fs.mkdirSync('./.tig/refs');
            fs.mkdirSync('./.tig/refs/heads');
            fs.writeFileSync('./.tig/refs/heads/main', 'null');
            fs.writeFileSync('./.tig/head', 'main');
            fs.writeFileSync('./.tig/exclude.txt',
             '# Writte here files or pattern to exclude\n# line starting with # are comments');
    }
}


module.exports = {init}