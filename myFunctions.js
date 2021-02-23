const fs = require('fs');
const sha1 = require("sha1-file");
const readline = require('readline');
const copy = require('recursive-copy');



// Return a list of [hash, file name] from a commit id called leaf
function readTree(leaf, tree){
    let keys = leaf.keys;
    let filesName = keys.map(e => e[1])
    let ignore = leaf['deletedFiles'];
    if (leaf.next !== null){
        readTree(tree[leaf.next] ,tree).forEach(f => {
            if(!filesName.includes(f[1]) && !ignore.includes(f[1])){
                keys.push(f)
            }
        });
    }

    return keys;
}


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


function hashAndCopy(addFiles, path, alreadyStaged){
    return new Promise (function(key){
        let keys = [];
        if(addFiles.length === 0){
            return key(keys)
        }
        let test = alreadyStaged || [];
        addFiles.forEach(function(f) {
            sha1(f)
            .then(h => {
                if (!test.includes(h)){
                    copy(f, path + h, (err) => err && console.error(err));
                    test.push(h); 
                }
                keys.push([h,f]);
                if(keys.length === addFiles.length){
                    return key(keys);
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


module.exports = {hashAndCopy, excludeFiles, askMsg, readTree, read, readPath, checkFileName, simpl, readfullpath}