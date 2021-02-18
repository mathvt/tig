const fs = require('fs');
const copy = require('recursive-copy');
const { read, askMsg, readfullpath, readTree } = require('../myFunctions')



// revert but not commit
function revert(num){
    let testNum = parseInt(num , 10)
    let path = read('./.tig/header.txt');
    let testPath = parseInt(path , 10)
    if ( isNaN(testNum) || testNum > testPath || testNum < 0){  // Test if the revert is valid
        return console.log('Wrong commit id to revert')
    }
    askMsg('you will lose all change that have not been commited. Continue ? y/n')
    .then(function(msg){
        let re = /^(y|Y)/i
        if(re.test(msg)){
            let tree = JSON.parse(read('./.tig/tree.json'));
            let revertKeys = readTree(tree[num], tree); // hash and files name of the commit id
            files = readfullpath('.');
            let dir = []
            files.forEach(f => !fs.lstatSync(f).isDirectory() ? fs.rmSync(f) : dir.push(f));//    TODO replace 
            dir.forEach(f => fs.rmdirSync(f))                                               //  just what's needed
            revertKeys.forEach(f => copy('./.tig/data/'+f[0], f[1]))// copy files of the commit id
            console.log('Revert done. Stage and commit to save change.')    
        }
        else{
            console.log('Aborted')
        }
    })
    .catch((err) => err && console.error(err))
}

module.exports = {revert}