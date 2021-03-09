const { read } = require('../myFunctions')

// return the last x commit
function history(num){
    let histo = commitHistory();
    if(num){
        num = parseInt(num, 10)
    }

    for (data of histo){
        let info = data.id.slice(0,8) + '   ' + data.comment + '   ' + data.time
        console.log(info);
        num && num--;
        if (num <= 0){return}
    }
}

module.exports = {history}


function commitHistory(commit){
    let id = commit || read('./.tig/refs/heads/' + read('./.tig/head'))
    commit = read('./.tig/object/'+id).split('\n')
    let hist = [{id, comment: commit[1], time: commit[2]}]
    if(commit[3] !== 'null'){
        hist = hist.concat(commitHistory(commit[3]))
    }
    return hist
}