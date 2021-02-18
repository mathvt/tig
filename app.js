const yargs = require('yargs');



const argv = yargs
    .command('init', 'Track files of a new project')
    .command('commit', 'Record changes of your project',{
        message: {
            description: 'what changes? Use: -m your message',
            alias: 'm',
            type: 'string',
        }
    })
    .command('add <option>', 'add . stage all files, or add <file or dir> only stage specified location')
    .command('history [numToShow]', 'show history of commit')
    .command('revert <numToREv>', 'revert almost like in git')  
    .command('$0', 'the default command', () => {}, (argv) => {
        console.log('wrong command')
      })
    .help()
    .alias('help','h')
    .argv;


const { init } = require('./commands/init');
const { addDot, addSomething } = require('./commands/add')
const { commit } = require('./commands/commit')
const { history } = require('./commands/history')
const { revert } = require('./commands/revert')



if (argv._.includes('init')){         
    init();
}


if (argv._.includes('add') && argv.option === '.'){
    addDot();
}

else if(argv._.includes('add') && argv.option){
    addSomething(argv.option);
}


if (argv._.includes('commit')){
    commit(argv.message);
}    



if (argv._.includes('history')){
    history(argv.numToShow);
}

if (argv._.includes('revert')){
    revert(argv.numToREv);
}




