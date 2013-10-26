var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var _ = require('lodash');
var Rx = require('rx');
var rxjs_fs = require('rxjs-fs');
function browserifyObs(options, b) {
    return Rx.Observable.create(function(observer) {
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

        var bundleObs = mkPathObs(out)
            .select(function() {
                var b = browserify()
                    .add(srcPath);

                // Adds the externals
                browserifyExternals(b, externals);
                excludeExternals(b, externals);

                return b;
            })
            .selectMany(function(b) {
                return browserifyObs({debug: debug}, b);
            })
            .selectMany(function(src) {
                return fsWriteFile(bundlePath, src);
            });

        var buildHtmlObs = fsExistsObs(srcHtml)
            .selectMany(function(exists) {
                if (exists) {
                    return getHTMLObs(srcHtml);
                }
                return getEmptyHTML();
            })
            .selectMany(function(html) {
                return fsWriteFile(htmlPath, html);
            });

        Rx.Observable.zip(buildHtmlObs, bundleObs, function() {})
            .subscribe(function() {
                var i = 0;
            });
        // b.bundle({debug: debug}, function(err, src) {
        //     if (!err) {
        //         mkpath(out, function(err) {
        //             if (!err) {
        //                 var bundlePath = path.join(out, 'bundle.js');
        //                 var htmlPath = path.join(out, 'index.html');
        //                 var srcHtml = path.join(srcPath, 'index.html');

        //                 console.log("Writing Bundle: " + bundlePath + " : Html to: " + htmlPath);
        //                 fs.writeFile(bundlePath, src, function(err) {
        //                     if (err) {
        //                         console.log('Error JS(' + srcPath + '): ' + err);
        //                     }
        //                 });

        //                 fs.exists(srcHtml, function(exists) {

        //                     if (exists) {

        //                         fs.readFile(srcHtml, function(err, html) {
        //                             if (err) {
        //                                 console.log('Could not read source html: ' + srcHtml);
        //                             } else {
        //                                 fs.writeFile(htmlPath, getHtml(html.toString()), function(err) {

        //                                     if (err) {
        //                                         console.log('Error HTML(' + srcPath + '): ' + err);
        //                                     }
        //                                 });
        //                             }
        //                         });
        //                     } else {
        //                         fs.writeFile(htmlPath, getHtml(), function(err) {
        //                             if (err) {
        //                                 console.log('Error HTML(' + srcPath + '): ' + err);
        //                             }
        //                         });
        //                     }
        //                 });
        //             }
        //         });
        //     }
        // });
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

        // Adds the externals
        browserifyExternals(b, externals);

        b.bundle({debug: debug}, function(err, src) {
            if (err) {
                console.log("Error compiling core");
            } else {

                mkpath(out, function(err) {
                    if (err) {
                        console.log("Could not create path for bundles");
                    } else {

                        console.log("Writing Core: " + bundlePath);
                        fs.writeFile(bundlePath, src, function(err) {
                            if (err) {
                                console.log('Error JS(core): ' + err);
                            }
                        });
                    }
                });
            }
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
            links += _.template(linkTemplate, {
                href: modules[k],
                displayName: k
            });
        }
        fs.writeFile(exampleDir + 'index.html', _.template(getHtmlExamplePage(), {links: links}), function(err) {
            if (err) {
                console.log('Error HTML(' + exampleDir + 'index.html): ' + err);
            }
        });
    }
}

// TODO: Create this into something read from manifest.json
function browserifyExternals(b, externals) {
    b.require(externals + 'jquery.js', {expose: 'jquery'});
    b.require(externals + 'rx.js', {expose: 'rx'});
    b.require(externals + 'rx.binding.js', {expose: 'rxjs-bindings'});
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