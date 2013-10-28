var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var _ = require('lodash');
var Rx = require('rx');
var rxjs_fs = require('rxjs-fs');

var REQUIRED_PATH = 'examples/observables';

function browserifyObs(srcPath, externals, options) {
    return Rx.Observable.create(function(observer) {

        var b = browserify()
            .add(srcPath);

        // Adds the externals
        browserifyExternals(b, externals);

        if (options.excludeExternals) {
            excludeExternals(b, externals);
        }

        b.bundle(options, function(err, src) {
            if (err) {
                observer.onError();
            } else {
                observer.onNext(src);
                observer.onCompleted();
            }
        });
    });
}

function mkPathObs(path) {
    return Rx.Observable.create(function(observer) {
        mkpath(path, function() {
            observer.onNext();
            observer.onCompleted();
        });
    });
}

function fsWriteFile(path, src) {
    return Rx.Observable.create(function(observer) {
        fs.writeFile(path, src, function() {
            observer.onNext();
            observer.onCompleted();
        });
    });
}

function fsExistsObs(path) {
    return Rx.Observable.create(function(observer) {
        fs.exists(path, function(exists) {
            observer.onNext(exists);
            observer.onCompleted();
        });
    });
}

function readyBundle(b, options, path) {
    return Rx.Observable.zip(
        browserifyObs(options, b),
        mkPathObs(path),
        function(src) {
            return src;
        }
    );
}

function rxFsReadFile(src) {
    return Rx.fs.readfile(src)
        .select(function(data) {
            return data.file; 
        });
}

function getHTMLObs(file) {
    return rxFsReadFile(file)
        .select(function(html) {
            return getHtml(html);
        });
}

function getEmptyHTML() {
    return Rx.Observable.create(function(observer) {
        observer.onNext(getHtml());
        observer.onCompleted();
    });
}

module.exports = {
    compile: function(debug, srcPath, externals, out) {

        var bundlePath = path.join(out, 'bundle.js');
        var htmlPath = path.join(out, 'index.html');
        var srcHtml = path.join(srcPath, 'index.html');

        // Having troubles if required path is not constructed first.
        var makeObs = mkPathObs(REQUIRED_PATH)
            .selectMany(function() {
                return mkPathObs(out);
            });

        var bundleObs = makeObs
            .selectMany(function() {
                return browserifyObs(srcPath, externals, 
                    {debug: debug, excludeExternals: true});
            })
            .selectMany(function(src) {
                return fsWriteFile(bundlePath, src);
            });

        var buildHtmlObs = makeObs
            .selectMany(function() {
                return fsExistsObs(srcHtml);
            })
            .selectMany(function(exists) {
                if (exists) {
                    return getHTMLObs(srcHtml);
                }
                return getEmptyHTML();
            });


        Rx.Observable.zip(buildHtmlObs, bundleObs, function(html) {
            return html;
        }).selectMany(function(html) {
            return fsWriteFile(htmlPath, html);
        }).subscribe(function() {
            console.log('Finished compilation');
        });
    },
    /**
     * Builds the core compilation process.  This is where
     * we build out the core library that is used in every
     * bundle
     * @param {Boolean} debugfd
     * @param {String} externals
     * @param {String} out
     */
    coreCompile: function(debug, externals, out) {
        var b = browserify()
            .add(externals + 'index.js');

        var bundlePath = path.join(out, 'core.js');

        var obs = browserifyObs(externals + 'index.js', externals, {
            debug: debug
        });
        var mkPObs = mkPathObs(out)
            .selectMany(obs)
            .selectMany(function(src) {
                return fsWriteFile(bundlePath, src);
            });

        mkPObs.subscribe(function() {
            console.log('Core compiled: ' + bundlePath);
        });
    },
    /**
     * Takes all the modules and builds links to them into an index page
     * @param modules
     */
    exampleHtml: function(modules, exampleDir) {
        var linkTemplate = '<li><a href="<%= href %>"><%= displayName %></a></li>';
        var links = '';
        for (var k in modules) {
            console.log('Module: ' + k);
            links += _.template(linkTemplate, {
                href: modules[k],
                displayName: k
            });
        }
        fsWriteFile(
            exampleDir + 'index.html', 
            _.template(getHtmlExamplePage(), {links: links})
        ).subscribe();
    }
}

// TODO: Create this into something read from manifest.json
function browserifyExternals(b, externals) {
    b.require(externals + 'jquery.js', {expose: 'jquery'});
    b.require(externals + 'rx.js', {expose: 'rx'});
    b.require(externals + 'rx.binding.js', {expose: 'rxjs-bindings'});
    b.require('ix', {expose: 'ix'});
    b.require('d3', {expose: 'd3'});
    b.require('lodash', {expose: 'lodash'});
}

/**
 * Exclude all the externals
 * @param {Browserify} b
 */
function excludeExternals(b, externals) {
    b.external(externals + 'jquery.js');
    b.external(externals + 'rx.js');
    b.external(externals + 'rx.binding.js');
    b.external('ix');
    b.external('lodash');
    b.external('d3');
    b.external('lodash');
}

/**
 * Gets the html required for this build to display what happens
 * @param {String} html
 * @param {Any} [options]
 */
function getHtml(html, options) {
    options = _.assign({
        code: '',
        scripts: '',
        links: ''
    }, options);
    options.scripts = getSources();
    html = html || '<!DOCTYPE html>\n<html><head><%= scripts %></head><body></body></html>';
    return _.template(html, options);
}

/**
 * Builds the example page
 * @returns {string}
 */
function getHtmlExamplePage() {
    return '<!DOCTYPE html>\n' +
        '<html>' +
            '<head></head>' +
            '<body>' +
                '<ul><%= links %></ul>'
            '</body>' +
        '</html>';
}

/**
 * Gets the sources
 * @returns {string}
 */
function getSources() {
    return '<script type="text/javascript" src="/examples/core.js"></script>' +
        '<script type="text/javascript" src="bundle.js"></script>' +
        '<link rel="stylesheet" href="/examples/static/bootstrap/css/bootstrap.min.css">' +
        '<link rel="stylesheet" href="/examples/static/bootstrap/css/bootstrap-responsive.min.css">';
}