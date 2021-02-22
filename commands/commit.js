const fs = require('fs')
const { readfullpath, askMsg, read, simpl } = require('../myFunctions');


    function commit(msg){
        if(!fs.existsSync('./.tig')){
            return console.log('project not initialized');
        }
        if(!fs.existsSync('./.tig/stage.json')){
            return console.log('nothing to commit');
        }
        (async function(){
            try{
                message = msg || await askMsg('Comment : ');
                let stage = JSON.parse(read('./.tig/stage.json'));
                let key = stage[0];
                let remove = stage[1];
                stage[2].forEach(e => console.log(green,'     modified :   ' + simpl(e)))
                stage[3].forEach(e => console.log(green,'     added :   ' + simpl(e)))
                stage[1].forEach(e => console.log(green,'     removed :   ' + simpl(e)))
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
                if(fs.existsSync('./.tig/tree.json')){
                    tree = JSON.parse(read('./.tig/tree.json'));
                    path = 0;
                    for (let leaf in tree){
                        if (parseInt(leaf,16) > path){
                            path = parseInt(leaf,16)
                        }
                    }
                    nextPath = parseInt(path, 16) + 1;
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