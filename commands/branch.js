const fs = require('fs');
const { read } = require('../myFunctions');
const { revert } = require('./revert')



function createNewBranch(name){
    let branchList = fs.readdirSync('./.tig/refs/heads/');
    if(branchList.includes(name)){
        return console.log('This branch name already exist')
    }
    let commit = read('./.tig/refs/heads/' + read('./.tig/head'))
    fs.writeFileSync('./.tig/refs/heads/'+ name, commit);
}



function changeBranch(name){
    if (!name){
        return console.log('You must specify an existing branch name.')
    }
    let current = read('./.tig/head');
    if (name === current){
        return console.log('Already on the '+current+' branch')
    }
    let branchList = fs.readdirSync('./.tig/refs/heads/');
    if(!branchList.includes(name)){
        return console.log('This branch does not exist')
    }
    if(fs.existsSync('./.tig/index')){
        return console.log('Please commit or unstage before switching branch');
    }
    let newHead = read('./.tig/refs/heads/'+name)
    revert(newHead)
    .then((res) => {
        if(res === 'Done'){
            fs.writeFileSync('./.tig/head', name, err => console.error(err));              
        }
    })
    .catch((err) => console.err(err))
}



function branchList(){
    let current = read('./.tig/head')
    let branchList = fs.readdirSync('./.tig/refs/heads/');
    branchList.forEach(b => {
        b === current ? console.log(' * '+b) : console.log('   '+b);
    })
}


module.exports = {changeBranch, createNewBranch, branchList}






