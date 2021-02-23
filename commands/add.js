const fs = require('fs');
const { readPath, hashAndCopy, read, readTree, checkFileName } = require('../myFunctions');

//TODO unstage

function addDot(){
    let project = readPath('.');
    let stage = staging(project, 'all');
    if (stage.every(f => f.length === 0)){
        return console.log('nothing change');
    }
    if(fs.existsSync('./.tig/stage.json')){
        files = fs.readdirSync('./.tig/stage/');
        files.forEach(f => fs.rmSync('./.tig/stage/'+f));
    }
    manageAdded(stage);
}

function addSomething(fileOrDir){
    fileOrDir = checkFileName(fileOrDir);
    files = readPath('.');
    let stage;
    if(fs.existsSync(fileOrDir)){
        if(fs.lstatSync(fileOrDir).isDirectory()){
            fileOrDir = readPath(fileOrDir);
        }
        else{
            fileOrDir = [fileOrDir];
        }
        stage = staging(fileOrDir, 'exist', files);
    }
    else{
        stage = staging(fileOrDir, 'notexist', files);
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
    let oldStage = [[],[]];
    if(fs.existsSync('./.tig/stage.json')){
        oldStage = JSON.parse(read('./.tig/stage.json'));
    }
    let toadd = stage[0].concat(stage[1]);
    key = hashAndCopy(toadd, './.tig/stage/', fs.readdirSync('./.tig/stage/'))
    .then(function(key){
        oldStage[0].forEach(e =>{ 
            if(toadd.includes(e[1]) && !key.includes(e)){
                fs.rmSync('./.tig/stage/'+e[0])
            }
            else if (!toadd.includes(e[1])){
                key.push(e);
            }
        });

        stage[2].forEach(f => !oldStage[1].includes(f) && oldStage[1].push(f))
        oldStage[1] = oldStage[1].filter(f => !project.includes(f))
        stage = [key, oldStage[1], stage[0], stage[1]];
        stage = JSON.stringify(stage);
        fs.writeFileSync('./.tig/stage.json', stage, err => console.error(err));     
    })
    .catch ((err) => console.error(err));

}


// for add .
// like the last function but compare all files and dir
function manageAdded(stage){
    showChanges(stage);
    let toadd = stage[0].concat(stage[1]);
    key = hashAndCopy(toadd, './.tig/stage/')
    .then(function(key){
        stage = [key, stage[2], stage[0], stage[1]];
        stage = JSON.stringify(stage);
        fs.writeFileSync('./.tig/stage.json', stage, err => console.error(err));         
    })
    .catch ((err) => console.error(err));
}


// make 3 lists of files : modified, add, remove
function staging(project, test, files){
    let old = []
    if(fs.existsSync('./.tig/header.txt')){
        let tree = JSON.parse(read('./.tig/tree.json'));
        let path = read('./.tig/header.txt');
        old = readTree(tree[path], tree); //...[hash, filesname]
        old = old.map(f => ['./.tig/data/'+f[0],f[1]])
    }
    let result;
    if(test === 'all'){      // add .
        result =compareAllFiles(project, old);
    }   
    else if(test === 'exist'){      // add "existing file or dir"
        result = compareSomeFiles(project, old, files)
    }
    else if(test === 'notexist'){      // add "deleted file or dir"
        result = compareMissingFiles(project, old)
    }
    //result = result.map(e => excludeFiles(e))
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


function compareSomeFiles(project, old, files){
    let oldName = old.map(e => e[1]);
    let add = project.filter(f => !oldName.includes(f) && !fs.lstatSync(f).isDirectory());
    let remove = [];
    project.lenght === 1 && (remove = oldName.filter(f => project.includes(f)) && !files.includes(f));
    project.lenght > 1 && (remove = oldName.filter(f => !project.includes(f)) && !files.includes(f));
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


module.exports = {addDot, addSomething, compareAllFiles}