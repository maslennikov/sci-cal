'use strict';

$(function() {
    _.templateSettings.variable = 'data';

    //monkey-patching generated grammar :-(
    grammar.lexer.showPosition = function() {
        return '';
    };

    grammar.yy.parseError = function(msg, params) {
        //we have only one line in calculator
        msg = msg.replace(/ on line [0-9]*/, '');
        var e = new Error(msg);

        if (e.message.indexOf('Lexical') >= 0) {
            e.html = 'Error in expression: <i>' +
                grammar.lexer.upcomingInput() + '</i>';
        } else {
            e.html = 'Unexpected input: <i>' + params.text + '</i>';
        }

        console.log('Grammar error: %s', msg);
        throw e;
    };


    var cal = new App.SciCal();

    var calView = new App.SciCalView({
        model: cal,
        el: '#sci-cal'
    }).render();
});
