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
    .command('switch [branchName]', 'change or create new branch',{
        newBranch: {
            description: 'create a new branch',
            alias: 'c',
            type: 'string',
        }
    })
    .command('branch', 'list existing branch')

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
const { branch, createNewBranch, changeBranch } = require('./commands/branch')


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


if (argv._.includes('switch') && argv.branchName){
    changeBranch(argv.branchName,);
}
else if (argv._.includes('switch') && argv.newBranch){
    createNewBranch(argv.newBranch);
}


if (argv._.includes('branch')){
    branch();
}

