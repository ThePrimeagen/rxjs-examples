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

    var z1 = jQueryObserver($('#zip1'));
    var z2 = jQueryObserver($('#zip2'));
    var $output1 = $('.output1');
    var zGroup1 = Rx.Observable.zip(z1, z2, function(one, two) {
        return 'Clicked: ' + one.id + ' :: ' + two.id;
    }).subscribe(function(output) {
        $output1.append(output + '<br/>');
    });

    var z3 = jQueryObserver($('#zip3'));
    var z4 = jQueryObserver($('#zip4'));
    var z5 = jQueryObserver($('#zip5'));
    var z6 = jQueryObserver($('#zip6'));
    var $output2 = $('.output2');
    var zGroup1 = Rx.Observable.zip(z3, z4, z5, z6, function(three, four, five, six) {
        return 'Clicked: ' + [three.id, four.id, five.id, six.id].join(' :: ');
    }).subscribe(function(output) {
        $output2.append(output + '<br/>');
    });
});
