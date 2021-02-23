const fs = require('fs');
const { read, readTree, simpl, readPath } = require('../myFunctions');
const { compareAllFiles } = require('./add')


let green = '\x1b[32m%s\x1b[0m'
let red = '\x1b[31m%s\x1b[0m'

function status(){
    if(!fs.existsSync('./.tig')){
        return console.log('project not initialized');
    }
    let branch = read('./.tig/branch.txt');

    console.log('On branch '+branch+'\n');
    
    let stage = addedStatus();
    let mod = modifiedStatus(stage);

    if (mod === 1 && stage.every(e => e.length === 0)){
        console.log('Nothing to commit, working tree clean')
    }
}



function addedStatus(){
    if(!fs.existsSync('./.tig/stage.json')){
        return [[],[]]
    }
    console.log('Changes to be commited :')
    let stage = JSON.parse(read('./.tig/stage.json'))
    stage[2].forEach(e => console.log(green,'     modified :   ' + simpl(e)))
    stage[3].forEach(e => console.log(green,'     added :   ' + simpl(e)))
    stage[1].forEach(e => console.log(green,'     removed :   ' + simpl(e)))
    return stage
}


function modifiedStatus(stage){
    let keysStage = stage[0]
    keysStage = keysStage.map(f => ['./.tig/stage/'+f[0],f[1]]) 
    let stageFiles = keysStage.map(e => e[1]) 

    if(!fs.existsSync('./.tig/tree.json')){
        console.log('No files commited yet')
        return 0
    }
    let tree = JSON.parse(read('./.tig/tree.json'));
    let path = read('./.tig/header.txt');
    old = readTree(tree[path], tree);
    old = old.map(f => ['./.tig/data/'+f[0],f[1]])
    old.forEach(e => !stageFiles.includes(e[1]) && keysStage.push(e));
    let project = readPath('.');
    let result = compareAllFiles(project, keysStage)
    if (result[0].length === 0 && result[1].length === 0 && result[2].every(e => stage[1].includes(e))){
        return 1
    }
    console.log('\nChanges not staged for commit')
    result[0].forEach(e => console.log(red,'     modified :   ' + simpl(e)))
    result[1].forEach(e => console.log(red,'     added :   ' + simpl(e)))
    result[2].forEach(e => !stage[1].includes(e) && console.log(red,'     removed :   ' + simpl(e)))
}



module.exports = {status}