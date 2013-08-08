var argv = require('optimist')
    .default({
        'env': 'dev',
        'ext': './external/'
    })
    .argv;
var fs = require('fs');
var compile = require('./compile');
var path = require('path');
var debug = argv.env === 'dev';
var example = './examples/';

// TODO: Build a core file that is appended into the externals and is "required" in
fs.readFile('./manifest.json', function(err, manifest) {

    // Builds core
    compile.coreCompile(debug, argv.ext, example);

    var modules = JSON.parse(manifest).modules;
    for (var k in modules) {
        console.log('Compiling Module: ' + modules[k]);
        compile.compile(debug, modules[k], argv.ext, './' + path.join(example, modules[k]));
    }

    compile.exampleHtml(modules, example);
});
