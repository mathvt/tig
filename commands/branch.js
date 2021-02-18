const fs = require('fs');
const {read} = require('../myFunctions');
const {revert} = require('./revert')



function createNewBranch(name){
    if (!name){
        return console.log('You must specify new branch name.')
    }
    let branchList = listBranch();
    if(branchList.includes(name)){
        return console.log('This branch name already exist')
    }
    console.log('The new branch will be created on the next commit')

    fs.writeFileSync('./.tig/branch.txt', name, err => console.error(err));
}



function changeBranch(name){
    if (!name){
        return console.log('You must specify an existing branch name.')
    }
    let current = read('./.tig/branch.txt');
    if (name === current){
        return console.log('Already on the '+current+' branch')
    }
    let branchList = listBranch();
    if(!branchList.includes(name)){
        return console.log('This branch does not exist')
    }
    let tree = JSON.parse(read('./.tig/tree.json'));
    let branchCommit = []
    for (let key in tree){
        if (tree[key]['branch'] === name){
            branchCommit.unshift(key)
        }
    }
    let head = branchCommit[0];
    revert(head);
    fs.writeFileSync('./.tig/branch.txt', name, err => console.error(err));
    fs.writeFileSync('./.tig/header.txt', head, err => console.error(err));
}



function branch(){
    if(!fs.existsSync('./.tig')){
        return console.log('project not initialized');
    }
    let current = read('./.tig/branch.txt')
    let branchList = listBranch();
    !branchList.includes(current) && branchList.push(current);
    branchList.forEach(b => {
        b === current ? console.log(' * '+b) : console.log('   '+b);
    })
}


module.exports = {changeBranch, createNewBranch, branch}






function listBranch(){
    let tree = JSON.parse(read('./.tig/tree.json'));
    let branchList = []
    for (key in tree){
        if (!branchList.includes(tree[key]['branch'])){
            branchList.push(tree[key]['branch'])
        }
    }
    return branchList;
}