const fs = require('fs')
const { checkFileName, read } = require('../myFunctions')


function reset(file){
    if(!fs.existsSync('./.tig/stage.json')){
        return console.log('nothing to reset');
    }
    file = checkFileName(file);
    let stage = JSON.parse(read('./.tig/stage.json'));
    if(!file || stage.every(e => !e.includes(file))){
        return console.log('file not found')
    }
    if(file){
        stage[0].forEach(e =>{
            if (e[1] === file){
                fs.rmSync('./.tig/stage/'+e[0])
            }
        });
        stage[0] = stage[0].filter(e => e[1] !== file)
        stage = stage.map(e => e.filter(f => f !== file))
        stage = JSON.stringify(stage);
        fs.writeFileSync('./.tig/stage.json', stage, err => console.error(err)); 
    }
    else{
        stage[0].forEach(f => fs.rmSync('./.tig/stage'+f[0]))
        fs.rmSync('./.tig/stage.json')
    }
}




module.exports = {reset}