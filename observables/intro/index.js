var $ = require('jquery');
var Rx = require('rx');

$(function() {

    // Sets up the events to be had
    $('body').append('<button id="always-respond">Always Respond</button>');
    $('body').append('<button id="every-other-respond">Half Respond</button>');
    $('body').append('<button id="never-respond">Never Respond</button>');
    $('body').append('<button id="only-2-respond">Only 2x Respond</button>');
    $('body').append('<button id="skip-2-respond">Skip 2x Respond</button>');
    $('body').append('<button id="fail-respond">Fail Respond</button>');

    var $container = $('body').append('<div style=""></div>')

    // -------------------------------------------------------------------------------------------
    //              Observable.create
    //
    //  The creation of an observable!  It is created through the namespace Observable and function is required
    // to be passed in.  The function should accept one parameter, an observer.
    // The observer will subscribe to 1 or more of the 3 available events.  onNext, onError, onComplete
    // -------------------------------------------------------------------------------------------
    function createObservableFromButton($button) {
        return Rx.Observable.create(function(observer) {
            $button.on('click', function(eventObj) {

                // Calls on next which will fire off the observable
                observer.onNext(eventObj);
            });

            // What is called upon dispose
            return function() {
                $button.off('click');
            };
        });
    }

    // An observer that will always return upon a click event
    var alwaysObserver = createObservableFromButton($('#always-respond'));

    // An observer that will only return every other click
    var everyOtherObserver = createObservableFromButton($('#every-other-respond'))
        .scan([0], function(a, b) {

            // Increments the 0th element of the array.  a originally starts off as [0].
            return [a[0] + 1, b];
        })
        .filter(function(value) {
            return value[0] % 2 === 0;
        });

    // An observer that will never return from a click
    var neverObserver = createObservableFromButton($('#never-respond'))
        .skipWhile(function() { return true; });

    // An observer that will only return 2x when clicked
    var take2Observer = createObservableFromButton($('#only-2-respond'))
        .take(2);

    // Skips the first two
    var skip2Observer = createObservableFromButton($('#skip-2-respond'))
        .skip(2);

    // Fail observer
    var failObserver = createObservableFromButton($('#fail-respond'))
        .select(function(value) {
            throw new Error('I am failing!!!');
        });


    // -------------------------------------------------------------------------------------------
    //              Observer
    //
    //   Observers do not have to be created through an interface, but can be Rx.Observer.create.
    // The functions execute based on onNext, onError, onComplete signals respectively.
    // onError / onComplete are optional
    // -------------------------------------------------------------------------------------------
    alwaysObserver.subscribe(function(str) {
        console.log('Always: Clicked');
    });
    everyOtherObserver.subscribe(function(str) {
        console.log('Every Other: Clicked ' + str);
    });
    neverObserver.subscribe(function(str) {
        console.log('Never: Clicked');
    });
    skip2Observer.subscribe(function(str) {
        console.log('Skip 2: Clicked');
    });
    take2Observer.subscribe(function(str) {
        console.log('Take 2: Clicked');
    }, null, function() {
        console.log('Completed the take 2.  No more events');
    });
    failObserver.subscribe(function(str) {
        console.log('Fail: Clicked');
    }, function(err) {
        console.log('Failed!!!! Error: ' + err);
    });
});