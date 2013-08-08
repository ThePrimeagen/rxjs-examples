var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var _ = require('lodash');

// TODO: Turn this into rx styled.  This is a pain
module.exports = {
    compile: function(debug, srcPath, externals, out) {
        var b = browserify()
            .add(srcPath);

        // Adds the externals
        browserifyExternals(b, externals);
        b.bundle({debug: debug}, function(err, src) {
            if (!err) {
                mkpath(out, function(err) {
                    if (!err) {
                        var bundlePath = path.join(out, 'bundle.js');
                        var htmlPath = path.join(out, 'index.html');

                        console.log("Writing Bundle: " + bundlePath + " : Html to: " + htmlPath);
                        fs.writeFile(bundlePath, src, function(err) {
                            if (err) {
                                console.log('Error JS(' + srcPath + '): ' + err);
                            }
                        });
                        fs.writeFile(htmlPath, getHtml(), function(err) {
                            if (err) {
                                console.log('Error HTML(' + srcPath + '): ' + err);
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
}

/**
 * Gets the html required for this build to display what happens
 * @param {String} bundlePath
 */
function getHtml() {
    return '<!DOCTYPE html>\n' +
        '<html>' +
            '<head><script type="text/javascript" src="bundle.js"></script></head>' +
            '<body></body>' +
        '</html>';
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