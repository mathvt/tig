const fs = require('fs');
const copy = require('recursive-copy');
const { isString } = require('util');
const { read, askMsg, readTree, checkFileName, readPath } = require('../myFunctions')



// revert but not commit
function revert(num, fileToRevert){
    return new Promise(function(res){
        let tree = JSON.parse(read('./.tig/tree.json'));
        if(num === undefined || num === 'header'){
            num = read('./.tig/header.txt')
        } 
        if(testIfValid(num, tree)){
            return console.log('invalid id')
        }
        if(fs.existsSync('./.tig/stage.json')){
            return console.log('Clean stage area before revert(commit or reset)');
        }
        askMsg('you will lose all change that have not been commited. Continue ? y/n')
        .then(function(msg){
            let re = /^(y|Y)/i
            if(!re.test(msg)){
                console.log('Aborded')
                return res('Aborted')
            }
            let revertKeys = readTree(tree[num], tree);    // hash and files name of the commit id
            if(fileToRevert){
                revertKeys = revertKeys.filter(e => e[1] === checkFileName(fileToRevert))
            }
            if(revertKeys.length === 0){                // test if given file was commited
                return console.log('file not found')
            }        
            let newFilesList = revertKeys.map(e => e[1]);
            files = readPath('.');
            if (!fileToRevert){
                files = removeFileAndDir(files, newFilesList);  // rm files and dir that does not match
            }
            revertKeys.forEach(f => {                       //compare files and remove those that have been modified
                if(files.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read('./.tig/data/'+f[0])))){
                    fs.rmSync(f[1])
                }
            })
            files = readPath('.');
            revertKeys.forEach(f => {       //copy files (replace those previously deleted if needed)
                if(!files.includes(f[1])){
                    copy('./.tig/data/'+f[0], f[1])
                }
            })
            console.log('Done')
            return res('Done')    
        })
    })
    .catch((err) => err && console.error(err))
}

module.exports = {revert}




function removeFileAndDir(files, newFilesList){
    let i = 0;
    files.forEach(f => {
        if(!newFilesList.includes(f)){
            i++
            fs.lstatSync(f).isDirectory() ? fs.rmdirSync(f) : fs.rmSync(f);
        }
    })
    if(i > 0){
        files = readPath('.'); 
        removeFileAndDir(files, newFilesList)
    }
    return files;
}



function testIfValid(num, tree){
    num = num.toString()
    for (let key in tree){
        if (key === num){
            return false
        }
    }
    return true
}