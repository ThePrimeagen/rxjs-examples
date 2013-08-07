var $ = require('jquery');
var Rx = require('rx');
var initSvg = require('./initialize_svg');
var d3 = require('d3');

$(function() {

    // Sets up the events to be had
    initSvg();

    // Listens to all clicks and the filter will return the element of which is clicked.
    var $svg = $('svg');
    var clickObservable = Rx.Observable.create(function(observer) {
        $svg.on('click', function(eventObj) {

            // Dispatches the svg pane then the src element
            observer.onNext(eventObj.target);
        });

        // Removes the svg handler
        return function() {
            $svg.off('click');
        }
    });

    // --------------------------------------------
    //  The set of observables that observe the click observable and will
    // fire off events if the filter is met
    // --------------------------------------------

    // Filtering based on id
    var id03Observable = Rx.Observable.concat(clickObservable)
        .select(function(target) {
            return target;
        })
        .filter(function(target) {
            return parseInt(target.id) < 3;
        });

    // Filtering based on id
    var id37Observable = Rx.Observable.concat(clickObservable)
        .select(function(target) {
            return target;
        })
        .filter(function(target) {
            var id = parseInt(target.id);
            return id >= 3 && id < 7;
        });

    // Filtering based on id
    var id710Observable = Rx.Observable.concat(clickObservable)
        .select(function(target) {
            return target;
        })
        .filter(function(target) {
            var id = parseInt(target.id);
            return id >= 7 && id < 10;
        });

    // ------------------------------------------------------
    //  The filtered observers
    // ------------------------------------------------------
    id03Observable.subscribe(function(target) {
        var $target = $(target);
        if ($target.data('active')) {
            d3.select(target)
                .transition()
                .attr('fill', 'white');
            $target.data('active', false);
        } else {
            d3.select(target)
                .transition()
                .attr('fill', 'red');
            $target.data('active', true);
        }
    });

    id37Observable.subscribe(function(target) {
        var $target = $(target);
        if ($target.data('active')) {
            d3.select(target)
                .transition()
                .attr('x', parseInt($target.attr('x')) + 50)
            $target.data('active', false);
        } else {
            d3.select(target)
                .transition()
                .attr('x', parseInt($target.attr('x')) - 50)
            $target.data('active', true);
        }
    });

    id710Observable.subscribe(function(target) {
        var $target = $(target);
        if ($target.data('active')) {
            d3.select(target)
                .transition()
                .attr('x', parseInt($target.attr('x')) + 25)
                .attr('y', parseInt($target.attr('y')) + 25)
                .attr('width', parseInt($target.attr('width')) - 25)
                .attr('height', parseInt($target.attr('height')) - 25)
            $target.data('active', false);
        } else {
            d3.select(target)
                .transition()
                .attr('x', parseInt($target.attr('x')) - 25)
                .attr('y', parseInt($target.attr('y')) - 25)
                .attr('width', parseInt($target.attr('width')) + 25)
                .attr('height', parseInt($target.attr('height')) + 25)
            $target.data('active', true);
        }
    });
});
