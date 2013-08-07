var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');

// TODO: Turn this into rx styled.  This is a pain
module.exports = function(debug, srcPath, externals, out) {
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
};

// TODO: Create this into something read from manifest.json
function browserifyExternals(b, externals) {
    b.require(externals + 'jquery.js', {expose: 'jquery'});
    b.require(externals + 'rx.js', {expose: 'rx'});
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