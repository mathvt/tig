const fs = require('fs');
const sha1 = require("sha1-file");
const readline = require('readline');
const copy = require('recursive-copy');



// Return a list of [hash, file name] from a commit id called leaf
function readTree(leaf, tree){
    let keys = leaf.keys;
    let filesName = keys.map(e => e[1])
    let ignore = leaf['ignoreFile'];

    if (leaf.next){
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
function readfullpath(dir){
    let files = [];
    let folder = fs.readdirSync(dir)
    folder.length === 0 && files.push(dir)
    folder.forEach(f => {        
        if(/tig/g.test(f)){}                                // use that to ignore files in the futur
        else if (fs.lstatSync(dir+'/'+f).isDirectory()){
            files = files.concat(readfullpath(dir+'/'+f));
        }
        else{
            files.push(dir+'/'+f);
        }
    })
    return files;
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


function hashAndCopy(addFiles, path, already){
    return new Promise (function(key){
        let keys = [];
        if(addFiles.length === 0){
            return key(keys)
        }
        let test = already || [];
        addFiles.forEach(function(f) {
            sha1(f)
            .then(h => {
                if (!test.includes(h)){
                    copy(f, path + h, (err) => {err && console.error(err); err && console.log(f)});
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


module.exports = {hashAndCopy, readfullpath, askMsg, readTree, read}