const fs = require('fs');
const sha1 = require("sha1-file");
const readline = require('readline');
const copy = require('recursive-copy');




function read(path){
    return fs.readFileSync(path, 'utf-8',err => console.error(err));
}

// make a list of all files and dir 
function readPath(path){
    return excludeFiles(readfullpath(path));
}


function readfullpath(dir){
    let files = [];
    let folder = fs.readdirSync(dir)
    folder.length === 0 && files.push(dir)
    folder.forEach(f => {        
        if(/tig/g.test(f)){}
        else if (fs.lstatSync(dir+'/'+f).isDirectory()){
            files = files.concat(readfullpath(dir+'/'+f));
        }
        else{
            files.push(dir+'/'+f);
        }
    })
    return files;
}


function excludeFiles(files){
    let reList = read('./.tig/exclude.txt').split('\n').filter(e => !(/^#/).test(e)).map(e => new RegExp(e))
    reList.length > 0 && reList.forEach(e => files = files.filter(f => !e.test(f)));
    return files
}


function askMsg (mess){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise (msg => {
        rl.question(mess, (m) => {
            msg(m);
            rl.close();
        });

    })
}


function hashAndCopy(addFiles, path){
    return new Promise (function(key){
        let keys = [];
        let doNotRm = [];
        if(addFiles.length === 0){
            return key([keys,doNotRm])
        }
        let files = fs.readdirSync('./.tig/object/')
        addFiles.forEach(function(f) {
            sha1(f)
            .then(h => {
                if (!files.includes(h)){
                    copy(f, path + h, (err) => err && console.error(err));
                }
                else{
                    doNotRm.push(h);
                }
                keys.push([h,f]);
                if(keys.length === addFiles.length){
                    return key([keys,doNotRm]);
                }
            })
            .catch ((err) => console.error(err));            
        })
    })
}


function checkFileName(file){
    if(!file || /^\.\//.test(file)){
        return file
    }
    else if(/^\//.test(file)){
        return '.'+file
    }
    else{
        return './'+file
    }
}

function simpl(e){
    return e.replace('./','')
}


function lastCommitOfBranch(name, tree){
    let branchCommit = []
    for (let key in tree){
        if (tree[key]['branch'] === name){
            branchCommit.unshift(key)
        }
    }
    return branchCommit[0];
}


function readCommit(id){
    id = id || read('./.tig/refs/heads/' + read('./.tig/head')) || false;
    if (id === false || id === 'null'){
        return [];
    }
    if (!isNaN(id)){
        id = nthCommit(id);
    }

    let commit = read('./.tig/object/'+id).split('\n')
    let tree = commit[0]
    return read('./.tig/object/'+tree).split('\n').map(e => e.split('  '));
}


function readIndex(){
    let index = read('./.tig/index').split('\n');
    index =  index.map((e,i) => i === 0 ? e.split('  ').map(e => e.split(',')) : e.split(','));
    return index.map(e => e[0] === '' ? [] : e);
}


function nthCommit(n, next){
    let id = next || read('./.tig/refs/heads/' + read('./.tig/head'))
    let commit = read('./.tig/object/'+id).split('\n')
    n--;
    if(n > -1 && commit[3] !== 'null'){
        id = nthCommit(n, commit[3])
    }
    return id
}


module.exports = {hashAndCopy, askMsg, read, readPath, checkFileName, simpl, readfullpath,
                  lastCommitOfBranch, readCommit, readIndex}