const fs = require('fs')
const { askMsg, read, simpl } = require('../myFunctions');


async function commit(msg) {
    if (!fs.existsSync('./.tig/stage.json')) {
        return console.log('nothing to commit');
    }
    try {
        message = msg || await askMsg('Comment : ');
        let stage = JSON.parse(read('./.tig/stage.json'));
        stage[2].forEach(e => console.log('     modified :   ' + simpl(e)))
        stage[3].forEach(e => console.log('     added :   ' + simpl(e)))
        stage[1].forEach(e => console.log('     removed :   ' + simpl(e)))        
        let key = stage[0];
        let remove = stage[1];
        files = fs.readdirSync('./.tig/data/')
        key.forEach((f) => {
            if (!files.includes(f[0])) {
                fs.copyFileSync('./.tig/stage/' + f[0], './.tig/data/' + f[0])
            }
        })
        let nextPath = 0;
        let tree = {};
        let path = null;
        let branch = read('./.tig/branch.txt')
        if (fs.existsSync('./.tig/tree.json')) {
            tree = JSON.parse(read('./.tig/tree.json'));
            path = 0;
            for (let leaf in tree) {
                if (parseInt(leaf, 16) > path) {
                    path = parseInt(leaf, 16)
                }
            }
            nextPath = parseInt(path, 16) + 1;
        }
        tree[nextPath] = {
            'keys': key,
            'deletedFiles': remove,
            'next': path,
            'comment': message,
            'branch': branch
        };
        tree = JSON.stringify(tree);
        fs.writeFileSync('./.tig/tree.json', tree, err => console.error(err));
        fs.writeFileSync('./.tig/header.txt', nextPath.toString(), err => console.error(err));
        fs.rmSync('./.tig/stage.json');
        files = fs.readdirSync('./.tig/stage/');
        files.forEach(f => fs.rmSync('./.tig/stage/' + f));
    } catch (err) { console.error(err) };
}


module.exports = {commit}