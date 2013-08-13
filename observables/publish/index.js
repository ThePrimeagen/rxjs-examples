var $ = require('jquery');
var Rx = require('rx');
var RxBindings = require('rxjs-bindings');
var initSvg = require('./initialize_svg');
var d3 = require('d3');

$(function() {

    // Sets up the events to be had
    initSvg();

    // Listens to all clicks and the filter will return the element of which is clicked.
    // *****  This takes advantage of publish.  If publish was not used, this function would be called
    // per observer listening. (thus binding n (which is 3) 'click' events to $svg)
    // Using publish will alievate that problem
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
    }).publish();

    // --------------------------------------------
    //  The set of observables that observe the click observable and will
    // fire off events if the filter is met
    // --------------------------------------------

    var id03Observable = clickObservable
        .filter(function(target) {
            return parseInt(target.id) < 3;
        });

    var id37Observable = clickObservable
        .filter(function(target) {
            var id = parseInt(target.id);
            return id >= 3 && id < 7;
        });

    var id710Observable = clickObservable
        .filter(function(target) {
            var id = parseInt(target.id);
            return id >= 7 && id < 10;
        });

    // ------------------------------------------------------
    //  The filtered observers
    // * Its easy to mix different libraries with rxjs
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

    // For publish to work fully.  You must call "connect" on the published observer.
    // This will cause events to start propagating
    clickObservable.connect();
});
