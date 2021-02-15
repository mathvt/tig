const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const copy = require('recursive-copy');
const readline = require('readline');
const sha1 = require("sha1-file");
const { resolve } = require('path');


const argv = yargs
    .command('init', 'Track files of a new project')
    .command('commit', 'Record changes of your project',{
        message: {
            description: 'what changes? Use: -m your message',
            alias: 'm',
            type: 'string',
        }
    })
    .command('add <option>', '<add .> stage all file, <add "file or dir"> only stage specified location')
    .command('history [numToShow]', 'show history of commit')
    .command('revert <numToREv>', 'revert almost like in git')  
    .command('$0', 'the default command', () => {}, (argv) => {
        console.log('wrong command')
      })
    .help()
    .alias('help','h')
    .argv;


if (argv._.includes('init')){          // create .tig folder
    if(fs.existsSync('./.tig/')){                         // TODO : allow some files to be ignored
        console.log('Project already initialised');
    }
    else{
            fs.mkdirSync('./.tig');
            fs.mkdirSync('./.tig/stage');
            fs.mkdirSync('./.tig/data');
    }
}


if (argv._.includes('add') && argv.option === '.'){
    (function(){
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
    })()

}
else if(argv._.includes('add') && argv.option){
    (function (){
        if(!fs.existsSync('./.tig')){
            return console.log('project not initialized');
        }
        let project = './'+ argv.option;
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
    })()
}


if (argv._.includes('commit')){
    (function(){
        if(!fs.existsSync('./.tig')){
            return console.log('project not initialized');
        }
        if(!fs.existsSync('./.tig/stage.json')){
            return console.log('project not initialized');
        }
        (async function(){
            try{
                message = argv.message || await askMsg('Comment : ');
                let stage = JSON.parse(read('./.tig/stage.json'));
                let key = stage[0];
                let remove = stage[1];
                console.log('files added of modified :')
                key.forEach(e => console.log(e[1]))
                console.log('remove :  '+remove)
                files = readfullpath('./.tig/data/')

                key.forEach((f) => {
                    if(!files.includes(f[0])){
                        fs.copyFileSync('./.tig/stage/'+f[0] , './.tig/data/'+f[0])
                    }
                })
                let nextPath = 0;
                let tree = {};
                let path = null;
                if(fs.existsSync('./.tig/header.txt')){
                    path = read('./.tig/header.txt');
                    nextPath = parseInt(path, 16) + 1;
                    tree = JSON.parse(read('./.tig/tree.json'));
                }
                tree[nextPath] = {
                    'keys' : key,
                    'ignoreFile' : remove,
                    'next' : path,
                    'comment' : message
                };
                tree = JSON.stringify(tree);
                fs.writeFileSync('./.tig/tree.json', tree, err => console.error(err));
                fs.writeFileSync('./.tig/header.txt', nextPath.toString(), err => console.error(err));
                fs.rmSync('./.tig/stage.json');
                files = fs.readdirSync('./.tig/stage/');
                files.forEach(f => fs.rmSync('./.tig/stage/'+f));
                console.log('ok');
            } catch (err) {console.error(err)};
        })();
    })()
}    



if (argv._.includes('history')){
    history(argv.numToShow);
}

if (argv._.includes('revert')){
    revert(argv.numToREv);
}







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
    key = hashAndCopy(toadd, './.tig/stage/', './.tig/stage/')
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
    key = hashAndCopy(toadd, './.tig/stage/', readfullpath('./.tig/stage/'))
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



// revert but not commit
function revert(num){
    let testNum = parseInt(num , 10)
    let path = read('./.tig/header.txt');
    let testPath = parseInt(path , 10)
    if ( isNaN(testNum) || testNum > testPath || testNum < 0){  // Test if the revert is valid
        return console.log('Wrong commit id to revert')
    }
    askMsg('you will lose all change that have not been commited. Continue ? y/n')
    .then(function(msg){
        let re = /^(y|Y)/i
        if(re.test(msg)){
            let tree = JSON.parse(read('./.tig/tree.json'));
            let revertKeys = readTree(tree[num], tree); // hash and files name of the commit id
            files = readfullpath('.');
            let dir = []
            files.forEach(f => !fs.lstatSync(f).isDirectory() ? fs.rmSync(f) : dir.push(f)); // delete files
            dir.forEach(f => fs.rmdirSync(f))                                                // delete dir
            revertKeys.forEach(f => copy('./.tig/data/'+f[0], f[1]))    // copy files of the commit id
            console.log('Revert done. Stage and commit to save change.')    
        }
        else{
            console.log('Aborted')
        }
    })
    .catch((err) => err && console.error(err))
}


// return the last "num" commit
function history(num){
    let tree = JSON.parse(read('./.tig/tree.json'));
    let path = read('./.tig/header.txt');
    let hist = [];
    let i = parseInt(num, 10) || path + 1; // do the job
    for (let key in tree){
        tree[key]['no'] = key;
        hist.unshift(tree[key])
    }
    for (data of hist){
        console.log(data.no + '   ' + data.comment);
        i--;
        if (i <= 0){return}
    }
}


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