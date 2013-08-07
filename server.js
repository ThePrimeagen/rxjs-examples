var express = require('express');
var path = require('path');

var app = express()
    .use(express.static(path.join(__dirname, 'examples')))
    .use(express.static(path.join(__dirname, '/')))
    .listen('3000');
