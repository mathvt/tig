const { read } = require('../myFunctions')

// return the last x commit
function history(num){
    let tree = JSON.parse(read('./.tig/tree.json'));
    let path = read('./.tig/header.txt');
    let hist = [];
    if(num){
        num = parseInt(num, 10)
    }
    for (let key in tree){
        tree[key]['no'] = key;
        hist.unshift(tree[key])
    }
    for (data of hist){
        let info = data.no + '   ' + data.branch + '   ' + data.comment
        console.log((path == data.no) ? '*'+info : ''+info);
        num && num--;
        if (num <= 0){return}
    }
}

module.exports = {history}