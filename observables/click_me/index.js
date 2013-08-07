var $ = require('jquery');
var Rx = require('rx');
var $rx = require('rxjs-jquery');

$(function() {
    // Sets up the events to be had
    $('body').append('<button id="click-me">Click Me</button>');

    // Creates an observable on an event through jquery.  The return value is the created observable
    var observable = $('#click-me').bindAsObservable('click', function(eventObj) {

        // Calls on next which will fire off the observable
        observer.onNext(eventObj);

        // What is called upon dispose
        return function() {
            console.log("disposed!");
            $('#click-me').off('click');
        }
    }).skip(2)
        .take(2)
        .select(function(eventObj) {
            return "Clicked with: " + eventObj.target.id;
        });

    observable.subscribe(function(str) {
        console.log(str);
    });
});