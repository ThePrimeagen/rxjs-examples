var $ = require('jquery');
var Rx = require('rx');
var Ix = require('ix');


// Good news - Enumerables have many of the same methods that Observables do!
// You don't have to learn 2 new libraries ^^ 
$(function() {

    // How else to create?  .create method i get errors on moveNext()
    var en = Ix.Enumerable.repeat(1).select(function() {
        return Math.floor(Math.random() * 100);
    }).filter(function(val) {
        return val > 0.5;
    }).take(10).getEnumerator();

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
        if (en.moveNext()) {
            $output.append(en.getCurrent() + '<br/>');
        }
    });
});
