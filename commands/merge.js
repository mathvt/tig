const { read, lastCommitOfBranch, readTree } = require('../myFunctions')
const { listBranch } = require('./branch')



function merge(branch){
    let tree = JSON.parse(read('./.tig/tree.json'));
    let mainBranchName = read('./.tig/branch.txt');

    let test = check(branch, mainBranchName);
    if (test !== 1){
        return console.log(test);
    }

    let mainHeader = lastCommitOfBranch(mainBranchName, tree);
    let branchHeader = lastCommitOfBranch(branch, tree);
    let commonAncestor = findCommonAncestor(mainHeader, branchHeader, tree);
    
    if (commonAncestor === mainHeader){
        return fastFoward(); //TODO
    }

    let commonAncestorKeys = readTree(tree[commonAncestor], tree);
    let mainBranchKeys = readTree(tree[mainHeader], tree);
    let branchKeys = readTree(tree[branchHeader], tree);
    let mainBranchFiles = mainBranchKeys.map(e =>e[1]);
    
    let add = branchKeys.filter(e => !mainBranchFiles.includes(e[1]))

    //TODO
    
    
}


function findCommonAncestor(mainHeader, branchHeader, tree){
    let mainCommit = listCommitOfBranch(mainHeader, tree)
    let branchCommit = listCommitOfBranch(branchHeader, tree);
    return branchCommit.find(e => mainCommit.includes(e));
}


function listCommitOfBranch(leaf, tree){
    let list = [leaf];
    if(tree[leaf].next !== null){
        list = list.concat(listCommitOfBranch(tree[leaf].next, tree))
    }
    return list
}


function check (branch, main){
    let branchList = listBranch();
    if(!branchList.includes(branch)){
        return branch+' branch does not exist'
    }
    if(branch === main){
        return 'Cannot merge '+branch+' with the current branch '+main
    }
    return 1
}


module.exports = {merge}