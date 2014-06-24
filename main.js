'use strict';

$(function() {
    _.templateSettings.variable = 'data';

    var cal = new App.SciCal();

    var calView = new App.SciCalView({
        model: cal,
        el: '#sci-cal'
    }).render();
});
