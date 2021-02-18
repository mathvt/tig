const fs = require('fs')
const { readfullpath, askMsg, read } = require('../myFunctions');


    function commit(msg){
        if(!fs.existsSync('./.tig')){
            return console.log('project not initialized');
        }
        if(!fs.existsSync('./.tig/stage.json')){
            return console.log('project not initialized');
        }
        (async function(){
            try{
                message = msg || await askMsg('Comment : ');
                let stage = JSON.parse(read('./.tig/stage.json'));
                let key = stage[0];
                let remove = stage[1];
                key.length !== 0 && console.log('files added of modified :')
                key.forEach(e => console.log('   '+e[1]))
                remove.length !== 0 && console.log('removed :')
                remove.forEach(e => console.log('   '+e))
                files = readfullpath('./.tig/data/')

                key.forEach((f) => {
                    if(!files.includes(f[0])){
                        fs.copyFileSync('./.tig/stage/'+f[0] , './.tig/data/'+f[0])
                    }
                })
                let nextPath = 0;
                let tree = {};
                let path = null;
                let branch = read('./.tig/branch.txt')
                if(fs.existsSync('./.tig/header.txt')){
                    path = read('./.tig/header.txt');
                    nextPath = parseInt(path, 16) + 1;
                    tree = JSON.parse(read('./.tig/tree.json'));
                }
                tree[nextPath] = {
                    'keys' : key,
                    'ignoreFile' : remove,
                    'next' : path,
                    'comment' : message,
                    'branch' : branch
                };
                tree = JSON.stringify(tree);
                fs.writeFileSync('./.tig/tree.json', tree, err => console.error(err));
                fs.writeFileSync('./.tig/header.txt', nextPath.toString(), err => console.error(err));
                fs.rmSync('./.tig/stage.json');
                files = fs.readdirSync('./.tig/stage/');
                files.forEach(f => fs.rmSync('./.tig/stage/'+f));
                console.log('ok');
            } catch (err) {console.error(err)};
        })();
    }


module.exports = {commit}