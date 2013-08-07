var $ = require('jquery');
var Rx = require('rx');

$(function() {

    // Sets up the events to be had
    $('body').append('<button id="click-me">Click Me</button>');
    var $container = $('body').append('<div style=""></div>')

    // Creates binds the click event to an observable
    var observable = Rx.Observable.create(function(observer) {
        $('#click-me').on('click', function(eventObj) {

            // Calls on next which will fire off the observable
            observer.onNext(eventObj);
        });

        // What is called upon dispose
        return function() {
            $('#click-me').off('click');
        }
    })
        .skip(2) // skip the first 2
        .take(2) // take 2 total

        // From the value coming in (and event object) and it returns a string
        // The select function takes in a value and returns a value.
        .select(function(eventObj) {
            return "Clicked with: " + eventObj.target.id;
        });

    observable.subscribe(function(str) {
        $container.append('Clicked');
    }, null, function(str) {
        $container.append('Finished');
    });
});