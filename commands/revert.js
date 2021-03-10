const fs = require('fs');
const copy = require('recursive-copy');
const { read, askMsg, checkFileName, readPath, readCommit } = require('../myFunctions')



// revert but not commit
function revert(com, fileToRevert){
    return new Promise(function(res){
        if(com === undefined || com === 'header'){
            com = 0;
        }
        else if(com.length !== 40){
            com = parseInt(com, 10);
        }
        let tree = readCommit(com);
        if(fs.existsSync('./.tig/index')){
            return console.log('Clean stage area before revert(commit or reset)');
        }
        askMsg('you will lose all change that have not been commited. Continue ? y/n')
        .then(function(msg){
            let re = /^(y|Y)/i
            if(!re.test(msg)){
                console.log('Aborded')
                return res('Aborted')
            }
            if(fileToRevert){
                revertOneFile(fileToRevert,tree);
            }
            else{
                revertToCommit(tree)
            }
            console.log('Done')
            return res('Done')    
        })
    })
    .catch((err) => err && console.error(err))
}



function revertOneFile(fileToRevert,tree){
    fileToRevert = checkFileName(fileToRevert)
    tree = tree.filter(e => e[1] === fileToRevert)
    if(tree.length === 0){                // test if given file was commited
        console.log('file not found')
        return res('Aborted')
    }
    let newFilesList = tree.map(e => e[1]);
    files = readPath('.');
    files = removeFileAndDir(files, newFilesList);  // rm files and dir that does not match
    tree.forEach(f => {                       //compare files and tree and remove modified files
        if(files.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read('./.tig/object/'+f[0])))){
            fs.rmSync(f[1])
        }
    })
    files = readPath('.');
    tree.forEach(f => {       //copy files (replace those previously deleted if needed)
        if(!files.includes(f[1])){
            copy('./.tig/object/'+f[0], f[1])
        }
    })
}



function revertToCommit(tree){
    files = readPath('.');
    tree.forEach(f => {                       //compare files and tree and remove modified files
        if(files.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read('./.tig/object/'+f[0])))){
            fs.rmSync(f[1])
        }
    })
    files = readPath('.');
    tree.forEach(f => {       //copy files (replace those previously deleted if needed)
        if(!files.includes(f[1])){
            copy('./.tig/object/'+f[0], f[1])
        }
    })
}



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



module.exports = {revert, revertToCommit}