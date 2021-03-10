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


function commitHistory(commit){
    let id = commit || read('./.tig/refs/heads/' + read('./.tig/head'))
    console.log()
    if(id.length > 40){
        id = id.split(',')
        let hist = []
        id.forEach(e => {
            let histId = hist.map(e => e.id)
            commitHistory(e).forEach(el => !histId.includes(el.id) && hist.push(el))
            hist.sort((a,b) => convert(b) - convert(a))
        })
        return hist
    }
    commit = read('./.tig/object/'+id).split('\n')
    let hist = [{id, comment: commit[1], time: commit[2]}]
    if(commit[3] !== 'null'){
        hist = hist.concat(commitHistory(commit[3]))
    }
    return hist
}


module.exports = {history, commitHistory}


function convert(t){
    return parseInt(t['time'].replace(/\/|\:|\s/g,''),10)
}
