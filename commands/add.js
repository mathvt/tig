const fs = require('fs');
const { readPath, hashAndCopy, read, checkFileName, readCommit, readIndex } = require('../myFunctions');

//TODO unstage

function addDot(){
    let project = readPath('.');
    let stage = staging(project, 'all');
    if (stage.every(f => f.length === 0)){
        return console.log('nothing change');
    }
    if(fs.existsSync('./.tig/index')){
        unstage();
    }
    manageAdded(stage);
}

function addSomething(fileOrDir){
    fileOrDir = checkFileName(fileOrDir);
    let stage;
    if(fs.existsSync(fileOrDir)){
        stage = staging(fileOrDir, 'exist');
    }
    else{
        stage = staging(fileOrDir, 'notexist');
    }
    if (stage.every(f => f.length === 0)){
        return console.log('nothing change');
    }
    manageAddedBis(stage, fileOrDir);
}





// for spécified file of dir to stage
// make the staging area and save changes for the next commit
function manageAddedBis(stage, project){
    showChanges(stage);
    let oldStage = [[],[],[],[],[]];
    if(fs.existsSync('./.tig/index')){
        oldStage = readIndex();
    }
    let toadd = stage[0].concat(stage[1]);
    hashAndCopy(toadd, './.tig/object/')
    .then(function(key){
        key[1] = key[1].concat(oldStage[4]);
        oldStage[0].forEach(e =>{ 
            if(toadd.includes(e[1]) && !key[0].includes(e) && !key[1].includes(e[0])){
                fs.rmSync('./.tig/object/'+e[0])
            }
            else if (!toadd.includes(e[1])){
                key[0].push(e);
                stage[0].push(e[1])
            }
        });

        stage[2].forEach(f => !oldStage[3].includes(f) && oldStage[3].push(f))
        oldStage[3] = oldStage[3].filter(f => !project.includes(f))

        stage = [stage[0], stage[1], oldStage[3]];
        let index = key[0].map(e => e.join()).join('  ');
        stage.forEach(e => index = index + '\n' + e.join())
        index = index + '\n' + key[1].join()
        fs.writeFileSync('./.tig/index', index, err => console.error(err));
    })
    .catch ((err) => console.error(err));

}


// for add .
// like the last function but compare all files and dir
function manageAdded(stage){
    showChanges(stage);
    let toadd = stage[0].concat(stage[1]);
    hashAndCopy(toadd, './.tig/object/')
    .then(function(key){
        let index = key[0].map(e => e.join()).join('  ')
        stage.forEach(e => index = index + '\n' + e.join())
        index = index + '\n' + key[1].join()
        fs.writeFileSync('./.tig/index', index, err => console.error(err));
    })
    .catch ((err) => console.error(err));
}


// make 3 lists of files : modified, add, remove
function staging(project, test){
    let old = readCommit().map(f => ['./.tig/object/'+f[0],f[1]]) //...[hash, filesname]
    let result;
    if(test === 'all'){      // add .
        result =compareAllFiles(project, old);
    }   
    else if(test === 'exist'){      // add "existing file or dir"
        result = compareSomeFiles(project, old)
    }
    else if(test === 'notexist'){      // add "deleted file or dir"
        result = compareMissingFiles(project, old)
    }
    return result;
}



function compareAllFiles(project, old){
    let oldName = old.map(e => e[1]);
    let add = project.filter(f => !oldName.includes(f) && !fs.lstatSync(f).isDirectory());
    let remove = oldName.filter(f => !project.includes(f));
    let modified = old.filter(f =>
        project.includes(f[1]) && !fs.lstatSync(f[1]).isDirectory() &&
        !Buffer.from(read(f[1])).equals(Buffer.from(read(f[0])))
    );
    modified = modified.map(e => e[1])
    
    return [modified, add, remove]
}


function compareSomeFiles(project, old){
    let dir = false;
    if(fs.lstatSync(project).isDirectory()){
        dir = project
        project = readPath(project);
    }
    else{
        project = [fileOrDir];
    }
    let files = readPath('.');
    let oldName = old.map(e => e[1]);
    let add = project.filter(f => !oldName.includes(f) && !fs.lstatSync(f).isDirectory());
    let remove = [];
    if(dir){
        let reConstructor = '^'+dir;
        re = new RegExp(reConstructor);
        remove = oldName.filter(f => !project.includes(f) && !files.includes(f) && re.test(f));
    }
    else{
        remove = oldName.filter(f => project.includes(f)) && !files.includes(f)
    }
    let modified = old.filter(
        f => project.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read(f[0])))
    );
    modified = modified.map(e => e[1])
    return [modified, add, remove]
}


function compareMissingFiles(project, old){
    let oldName = old.map(e => e[1]);
    let reConstructor = '^'+project;
    re = new RegExp(reConstructor);
    let remove = oldName.filter(f => re.test(f));

    return [[], [], remove]
}


function showChanges(stage){
    if(stage[0].length > 0) {
        console.log('modified :');
        stage[0].forEach(f => console.log('     '+f));
    }
    if(stage[1].length > 0) {
        console.log('added :');
        stage[1].forEach(f => console.log('     '+f));
    }
    if(stage[2].length > 0) {
        console.log('removed :');
        stage[2].forEach(f => console.log('     '+f));
    }
}


function unstage(file){
    if(!fs.existsSync('./.tig/index')){
        return console.log('nothing to reset');
    }
    let index = readIndex();
    let key = index[0]
    let doNotRm = index[4];
    if (!file){
        key.forEach(e => !doNotRm.includes(e[0]) && fs.rmSync('./.tig/object/'+e[0]))
        fs.rmSync('./.tig/index');
        return
    }
    file = checkFileName(file);
    if(key.every(e => e[1] !== file)){
        return console.log('file already not staged')
    }
    key.forEach(e => {
        if(e[1] === file && !doNotRm.includes(e[0])){
            fs.rmSync('./.tig/object/'+e[0])
        }  
    })
    index = index.map((e,i) => i === 1 ? e.filter(f => f[1] !== file) : e.filter(f => f !== file));
    fs.writeFileSync('./.tig/index', index, err => console.error(err));
}


module.exports = {addDot, addSomething, compareAllFiles, unstage}