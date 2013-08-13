var $ = require('jquery');
var Rx = require('rx');

$(function() {

    function jQueryObserver($el) {
        return Rx.Observable.create(function(observer) {
            $el.on('click', function(eventObj) {

                // Dispatches the svg pane then the src element
                observer.onNext(eventObj.target);
            });

            // Removes the svg handler
            return function() {
                $el.off('click');
            }
        });
    }

    var takeObservable = jQueryObserver($('#take'));
    var untilObservable = jQueryObserver($('#until'));

    var taken = 0;
    takeObservable
        .takeUntil(untilObservable)
        .subscribe(function() {
            console.log('I am taking number ' + ++taken);
        }, null, function() {
            console.log('I am complete and took ' + taken);
        });

    untilObservable
        .subscribe(function() {
            console.log('TakeUntil complete conditioning should be executed now');
        });

});
