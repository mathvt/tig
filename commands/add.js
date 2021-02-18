const fs = require('fs');
const { readfullpath, hashAndCopy } = require('../myFunctions');



function addDot(){
    if(!fs.existsSync('./.tig')){
        return console.log('project not initialized');
    }
    let project = readfullpath('.');
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


function addSomething(project){
    if(!fs.existsSync('./.tig')){
        return console.log('project not initialized');
    }
    project = './'+ project;
    files = readfullpath('.');
    let stage;
    if(fs.existsSync(project)){
        if(fs.lstatSync(project).isDirectory()){
            project = readfullpath(project);
        }
        else{
            project = [project];
        }
        stage = staging(project, 'exist', files);
    }
    else{
        stage = staging(project, 'notexist', files);
    }
    manageAddedBis(stage, project);
}

module.exports = {addDot, addSomething}



// for spécified file of dir to stage
// make the staging area and save changes for the next commit
function manageAddedBis(stage, project){
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
    let oldStage = [[],[]];
    if(fs.existsSync('./.tig/stage.json')){
        oldStage = JSON.parse(read('./.tig/stage.json'));
    }
    let toadd = stage[0].concat(stage[1]);
    key = hashAndCopy(toadd, './.tig/stage/', readfullpath('./.tig/stage/'))
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
        stage = [key, oldStage[1]];
        stage = JSON.stringify(stage);
        fs.writeFileSync('./.tig/stage.json', stage, err => console.error(err));     
    })
    .catch ((err) => console.error(err));

}


// for add .
// like the last function but compare all files and dir
function manageAdded(stage){
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
    let toadd = stage[0].concat(stage[1]);
    key = hashAndCopy(toadd, './.tig/stage/')
    .then(function(key){
        stage = [key, stage[2]];
        stage = JSON.stringify(stage);
        fs.writeFileSync('./.tig/stage.json', stage, err => console.error(err));         
    })
    .catch ((err) => console.error(err));
}


// make 3 lists of files : modified, add, remove
function staging(project, test, files){
    let old = []
    let oldName = []
    if(fs.existsSync('./.tig/header.txt')){
        let tree = JSON.parse(read('./.tig/tree.json'));
        let path = read('./.tig/header.txt');
        old = readTree(tree[path], tree); //...[hash, filesname]
        oldName = old.map(e => e[1]);// [...filesname]        
    }
    let add = [];
    let remove = [];
    let modified = [];
    if(test === 'all'){      // add .
        add = project.filter(f => !oldName.includes(f));
        remove = oldName.filter(f => !project.includes(f));
        modified = old.filter(
            f => project.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read('./.tig/data/'+f[0])))
        );
    }   
    else if(test === 'exist'){      // add "existing file or dir"
        add = project.filter(f => !oldName.includes(f));
        
        project.lenght === 1 && (remove = oldName.filter(f => project.includes(f)) && !files.includes(f));
        project.lenght > 1 && (remove = oldName.filter(f => !project.includes(f)) && !files.includes(f));
        modified = old.filter(
            f => project.includes(f[1]) && !Buffer.from(read(f[1])).equals(Buffer.from(read('./.tig/data/'+f[0])))
        );
    }
    else if(test === 'notexist'){      // add "deleted file or dir"
        let reConstructor = '^'+project;
        re = new RegExp(reConstructor);
        remove = oldName.filter(f => re.test(f));
    }

    modified = modified.map(e => e[1]);
    return [modified, add, remove];
}