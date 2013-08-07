var _ = require('lodash');
var d3 = require('d3');

module.exports = function(width, height) {
    width = width || 400;
    height = height || 400;
    var rectWidth = 50;
    var rectHeight = 25;

    var svg = d3.select('body').append('svg')
        .attr('width', width + rectWidth * 2)
        .attr('height', height + rectHeight * 2);

    for (var i = 0; i < 10; i++) {
        var x = Math.round(50 + Math.random() * height - rectWidth);
        var y = Math.round(50 + Math.random() * width - rectHeight);

        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('id', i)
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .attr('fill', 'white');
    }

};