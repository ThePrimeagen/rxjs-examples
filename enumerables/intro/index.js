var $ = require('jquery');
var Rx = require('rx');
var Ix = require('ix');

$(function() {

    var en = Ix.Enumerable.create(function() {
        return Math.floor(Math.random() * 100);
    }).filter(function(val) {
        return val > 0.5;
    }).take(10);

    function jqueryObs($el) {
        return Rx.Observable.create(function(observer) {
            $el.on('click', function() {
                observer.onNext($el);
            });

            return function() {
                observer.onCompleted();
                $el.off('click');
            }
        });
    }

    var $next = $('#next');
    var $output = $('.output');
    var nextObs = jqueryObs($next).subscribe(function() {
        $output.append(en.next() + '<br/>');
    });
});
