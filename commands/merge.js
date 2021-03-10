const fs = require('fs');
const { read, readCommit } = require('../myFunctions')
const { commitHistory } = require('./history')
const { writteCommit } = require('./commit');
const { revertToCommit } = require('./revert');



function merge(branch){
    if(fs.existsSync('./.tig/index')){
        return console.log('Clean stage area before merge (commit or reset)');
    }
    let branchList = fs.readdirSync('./.tig/refs/heads/');
    let head = read('./.tig/head');
    if(!branchList.includes(branch)){
        return console.log(branch + ' branch does not exist')
    }
    if(head === branch){
        return console.log('already on '+ branch + ' branch')
    }
    let branchCommits = commitHistory(read('./.tig/refs/heads/'+branch)).map(e => e.id)
    let headCommits = commitHistory(read('./.tig/refs/heads/'+head)).map(e => e.id)
    if(headCommits.includes(branchCommits[0])){
        fs.writeFileSync('./.tig/refs/heads/'+ branch, headCommits[0].id);
        return;
    }
    let commonAncestor = headCommits.find(e => branchCommits.includes(e));

    let keys = compare(commonAncestor, branchCommits[0]);
    console.log(keys)
    fs.writeFileSync('./.tig/refs/heads/' + head, headCommits[0]+','+branchCommits[0], err => console.error(err));
    revertToCommit(keys);
    writteCommit(keys,'merge '+ branch + ' in ' + head);
}



module.exports = {merge}



function compare(commonAncestor, branchCommits){
    let commonKeys = readCommit(commonAncestor).map(e => e.join())
    let headKeys = readCommit()
    let branchKeys = readCommit(branchCommits)
    
    let headFiles = headKeys.map(e => e[1]);

    branchKeys.forEach(e => !headFiles.includes(e[1]) && headKeys.push(e))
    let newKeys = headKeys.map(e => e.join())
    branchKeys = branchKeys.map(e => e.join()).filter(e => !newKeys.includes(e)).map(e => e.split(','))
    headKeys = headKeys.filter(e => branchKeys.map(e => e[1]).includes(e[1])).map(e => e.join())
    branchKeys = branchKeys.map(e => e.join())

    commonKeys.forEach(e => {
        if(branchKeys.includes(e)){
            branchKeys.splice(branchKeys.indexOf(e),1)
        }
        if(headKeys.includes(e)){
            headKeys.splice(headKeys.indexOf(e),1)
            newKeys.splice(newKeys.indexOf(e),1)
        }
    })
    branchKeys = branchKeys.map(e => e.split(','))
    headKeys = headKeys.map(e => e.split(','))
    headFiles = headKeys.map(e => e[1])
    branchKeys.forEach(e => {
        if(!headFiles.includes(e[1])){
            newKeys.push(e.join())
            branchKeys.splice(branchKeys.indexOf(e),1)
        }
    })
    headKeys = headKeys.filter(e => branchKeys.map(e => e[1]).includes(e[1]))
    newKeys = newKeys.map(e => e.split(','))

    //console.log(branchKeys)
    //console.log(headKeys)
    //console.log(keys)

    if(branchKeys.length !== 0){
        return conflicts(branchKeys, headKeys)
    }

    return newKeys
}


function conflicts(branch, head){
    //todo
    return 'TODO'
}