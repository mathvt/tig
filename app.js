const yargs = require('yargs');
const fs = require('fs')

const { init } = require('./commands/init');
const { addDot, addSomething, unstage } = require('./commands/add')
const { commit } = require('./commands/commit')
const { history } = require('./commands/history')
const { revert } = require('./commands/revert')
const { branch, createNewBranch, changeBranch } = require('./commands/branch')
const { status } = require('./commands/status');
const { merge } = require('./commands/merge');


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
    .command('log [numToShow]', 'show history of commit')
    .command('revert [comToREv] [file]', 'revert but not commit')
    .command('switch [branchName]', 'change or create new branch',{
        newBranch: {
            description: 'create a new branch',
            alias: 'c',
            type: 'string',
        }
    })
    .command('branch', 'list existing branch')
    .command('status', 'status')
    .command('merge [name]', 'merge')
    .command('reset [name]', 'remove file from stage')

    .command('$0', 'the default command', () => {}, (argv) => {
        console.log('wrong command')
      })
    .help()
    .alias('help','h')
    .argv;



(function(){
    if (!argv._.includes('init') && !fs.existsSync('./.tig')){         
        return console.log('Project not initialized');
    }


    if (argv._.includes('commit')){
        commit(argv.message);
    }

    else if (argv._.includes('init')){         
        init();
    }

    else if (argv._.includes('add') && argv.option === '.'){
        addDot();
    }

    else if(argv._.includes('add') && argv.option){
        addSomething(argv.option);
    }

    else if(argv._.includes('reset')){
        unstage(argv.name);
    }

    else if (argv._.includes('log')){
        history(argv.numToShow);
    }

    else if (argv._.includes('revert')){
        revert(argv.comToREv, argv.file)
        .catch((err) => console.err(err))
    }

    else if (argv._.includes('switch') && argv.branchName){
        changeBranch(argv.branchName);
    }

    else if (argv._.includes('switch') && argv.newBranch){
        createNewBranch(argv.newBranch);
    }

    else if (argv._.includes('branch')){
        branch();
    }

    else if (argv._.includes('status')){         
        status();
    }
    else if (argv._.includes('merge')){
        merge(argv.name);
    }
})()

