const { read } = require('../myFunctions')

// return the last x commit
function history(num){
    let histo = commitHistory();
    if(num){
        num = parseInt(num, 10)
    }

    for (data of histo){
        let info = data.id.slice(0,8) + '   ' + data.comment
        console.log(info);
        num && num--;
        if (num <= 0){return}
    }
}

module.exports = {history}


function commitHistory(commit){
    let id = commit || read('./.tig/header')
    commit = read('./.tig/object/'+id).split('\n')
    let hist = [{id, comment: commit[1]}]
    if(commit[2] !== 'null'){
        hist = hist.concat(commitHistory(commit[2]))
    }
    return hist
}