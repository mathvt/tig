const fs = require('fs')
const { askMsg, read, simpl, readCommit, readIndex } = require('../myFunctions');
const crypto = require('crypto')


async function commit(msg) { //TODO : add time when commit
    if (!fs.existsSync('./.tig/index')) {
        return console.log('nothing to commit');
    }
    try {
        message = msg || await askMsg('Comment : ');

        let stage = readIndex();
        stage[1].forEach(e => console.log('     modified :   ' + simpl(e)))
        stage[2].forEach(e => console.log('     added :   ' + simpl(e)))
        stage[3].forEach(e => console.log('     removed :   ' + simpl(e)))
        let keys = stage[0];
        let remove = stage[3]
        
        let keysName = keys.map(e =>e[1]);
        readCommit().filter(e => !remove.includes(e[1]))
                    .forEach(e => !keysName.includes(e[1]) && keys.push(e))
                
        let newTree = keys.map(e => e.join('  ')).join('\n');
        let hash = sha1(newTree);
        fs.writeFileSync('./.tig/object/'+hash, newTree, err => console.error(err));

        let next = fs.existsSync('./.tig/header') ? read('./.tig/header') : null;
        let time = new Date();
        time =
            String(time.getDate()).padStart(2,'0') + '/' +
            String(time.getMonth() + 1).padStart(2,'0') + '/' +
            time.getFullYear() + ' ' +
            time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        
        let newCommit = hash + '\n' + message + '\n' + time + '\n' + next
        hash = sha1(newCommit);
        fs.writeFileSync('./.tig/object/'+hash, newCommit, err => console.error(err));
        fs.writeFileSync('./.tig/header', hash, err => console.error(err));
        fs.rmSync('./.tig/index');
    } catch (err) { console.error(err) };
}


module.exports = {commit}


function sha1(input){
    let sha1 = crypto.createHash('sha1')
    return sha1.update(input).digest('hex');
}