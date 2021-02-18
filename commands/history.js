const { read } = require('../myFunctions')

// return the last x commit
function history(num){
    let tree = JSON.parse(read('./.tig/tree.json'));
    let path = read('./.tig/header.txt');
    let hist = [];
    let i = parseInt(num, 10) || path + 1;
    for (let key in tree){
        tree[key]['no'] = key;
        hist.unshift(tree[key])
    }
    for (data of hist){
        let info = data.no + '   ' + data.branch + '   ' + data.comment
        console.log((path == data.no) ? '*'+info : ''+info);
        i--;
        if (i <= 0){return}
    }
}

module.exports = {history}