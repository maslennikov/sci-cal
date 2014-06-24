'use strict';

window.App = window.App || {};

//todo make it all in handlebars
App.calcButtons = {
    // deg: {style: 'drg btn--grey', help: 'Set trignometric mode to degrees'},
    // rad: {style: 'drg btn--grey', help: 'Set trignometric mode to radians'},
    // grad: {style: 'drg btn--grey', help: 'Set trignometric mode to gradians'},
    drg: {style: 'drg btn--grey', help: 'Trignometric mode: degrees/radians/gradians'},
    info: {style: 'info', label: 'i', help: 'Show the info panel'},
    hex: {style: 'base btn--grey', help: 'Convert expression to base 16'},
    oct: {style: 'base btn--grey', help: 'Convert expression to base 8'},
    bin: {style: 'base btn--grey', help: 'Convert expression to base 2'},
    utf8: {style: 'base btn--grey', help: 'Convert expression to UTF-8 character'},
    sin: {style: 'funcs btn--grey', help: 'Calculate sine of expression'},
    asin: {style: 'funcs btn--grey', label: 'sin<sup>-1</sup>', help: 'Calculate the inverse sine of expresnsion'},
    sqrt: {style: 'funcs btn--grey', label: '&radic;', help: 'Calculate the square root of expression'},
    abs: {style: 'funcs btn--grey', help: 'Calculate the absolute value expression'},
    cos: {style: 'funcs btn--grey', help: 'Calculate the co-sine of expression'},
    acos: {style: 'funcs btn--grey', label: 'cos<sup>-1</sup>', help: 'Calculate the inverse co-sine of expression'},
    cbrt: {style: 'funcs btn--grey', label: '<sup style="margin-right:-2pt">3</sup>&radic;', help: 'Calculate the cube root of expression'},
    pow: {style: 'funcs btn--grey', label: 'x<sup>&nbsp;y</sup>', help: 'Raise expression to the specified power'},
    tan: {style: 'funcs btn--grey', help: 'Calculate the tangent of expression'},
    atan: {style: 'funcs btn--grey', label: 'tan<sup>-1</sup>', help: 'Calculate the inverse tangent of expression'},
    pi: {style: 'funcs btn--grey', label: '&pi;', help: 'Insert the value of PI'},
    magice: {style: 'funcs btn--grey', label: '<i>e</i>', help: 'Insert the natural logarithm value E'},
    1: {style: 'digits'},
    2: {style: 'digits'},
    3: {style: 'digits'},
    4: {style: 'digits'},
    5: {style: 'digits'},
    6: {style: 'digits'},
    7: {style: 'digits'},
    8: {style: 'digits'},
    9: {style: 'digits'},
    0: {style: 'digits'},
    plusminus: {style: 'digits', label: '\u00B1'},
    decimal: {style: 'digits', label: '.'},
    div: {style: 'basefuncs btn--grey', label: '\u00F7'},
    mul: {style: 'basefuncs btn--grey', label: '\u00D7'},
    sub: {style: 'basefuncs btn--grey', label: '-'},
    add: {style: 'basefuncs btn--grey', label: '+'},
    clear: {style: 'edit btn--orange', label: 'AC', help: 'Clear the display (keypress: ESC)'},
    bs: {style: 'edit btn--orange', label: '\u232B', help: 'Delete a character (keypress: Backspace)'},
    eq: {style: 'result', label: '='}
};


App.SciCalView = Backbone.View.extend({
    el: $('#sci-cal'),

    events: {
        'click .btn': 'onButtonClicked',
        'mouseenter': 'onEnter',
        'mouseleave': 'onLeave',
        'keypress': 'onKeyPressed'
    },

    initialize: function() {
        this.$displayContent = this.$el.find(".display-content");
        this.$displayMode = this.$el.find(".display-mode");
        this.$displayError = this.$el.find(".display-error");

        this.listenTo(this.model, 'change', this.renderDisplay);
    },

    render: function() {
        this.createButtons();
        this.onInput('clear');
        this.renderDisplay();
        return this;
    }
});

App.SciCalView.prototype.createButtons = function() {
    var buttonTemplate = _.template($('#button-template').text());

    this.$el.find('.btn-slot').each(function() {
        var id = $(this).data('id');
        var props = App.calcButtons[id];
        if (!props) return;

        _.defaults(props, {
            id: id,
            help: '',
            style: '',
            label: id
        });

        $(this).append(buttonTemplate(props));
    });
};

App.SciCalView.prototype.renderDisplay = function() {
    var cursor = this.model.get('paneloffset');
    var text = this.model.get('panelvalue') || '0';
    //todo get rid of nbsp
    text = "&nbsp;" + text.substring(0, text.length - cursor) +
        '<span class="display-cursor">' +
        (text[text.length - cursor] || '') +
        '</span>' +
        text.substring(text.length - cursor + 1);

    this.$displayContent.html(text);

    text = this.model.get('errorvalue');
    this.$displayError.html(text);

    text = (['deg', 'rad', 'grad'])[this.model.get('drg')];
    this.$displayMode.html(text);
};

App.SciCalView.prototype.onEnter = function() {
    var $span = this.$el.find('span');
    $span.attr('tabindex', '1').attr('contenteditable', 'true');
    $span.focus();
};

App.SciCalView.prototype.onLeave = function() {
    var $span = this.$el.find('span');
    $span.removeAttr('contenteditable').removeAttr('tabindex');
    $span.blur();
};

App.SciCalView.prototype.onButtonClicked = function(event) {
    // Highlight the button by setting it's class list to "on"
    var $btn = $(event.currentTarget);
    $btn.addClass('btn--down');
    setTimeout(function() {
        $btn.removeClass('btn--down');
    }, 200);

    this.onInput($btn.data('id'));
    this.onEnter();
};

App.SciCalView.prototype.onKeyPressed = function(event) {
    if (event.metaKey || event.ctrlKey) return;
    event.stopPropagation();
    event.preventDefault();

    var key = "";
    switch(event.keyCode) {
    case 3:
    case 13:
    case 61:
        key = "eq";
        break;
    case 46:
        key = "decimal";
        break;
    case 63289:
    case 27:
        key = "clear";
        break;
    case 8:
        key = "bs";
        break;
    case 63234:
    case 37:
        key = "left";
        break;
    case 63235:
    case 39:
        key = "right";
        break;
    default:
        if (event.charCode < 0xF700) {
            key = String.fromCharCode(event.charCode);
            if (key=='*') key="mul";            // So we can highlight the button
            else if (key=='/') key="div";
            else if (key=='+') key="add";
            else if (key=='-') key="sub";
            else if (key=='=') key="eq";
            else if (key=='.') key="decimal";
        }
    }
    if (key) {
        this.onInput(key);
    }
};

App.SciCalView.prototype.onInput = function(id) {
    if (id == 'info') {
        // swapPanel("front", "back");
    } else {
        this.model.onButton(id);
    }
};


// todo some legacy stuff dealing with osx widget functionality, make sure it
// doesn't break anything

// // Open a URL - how depends on whether we're a widget or not
// function openURL(url) {
//     if (window.widget) {
//         window.widget.openURL(url);
//     } else {
//         location.href=url;
//     }
// }

// function eventCopy(event) {
//     event.clipboardData.setData('text/plain', JsCalc.getDisplayText());
//     event.preventDefault();
//     event.stopPropagation();
// }

// function eventCut(event) {              // Likely to be Safari only
//     event.clipboardData.setData('text/plain', JsCalc.getDisplayText());
//     event.preventDefault();
//     event.stopPropagation();
//     doButton("clear");
// }

// function eventPaste(event) {            // Likely to be Safari only
//     var text = event.clipboardData.getData('text/plain');
//     JsCalc.setDisplayText(text.replace(/,/g, ''));
//     event.preventDefault();
//     event.stopPropagation();
//     doButton("");
// }


// function swapPanel(from, to) {
//     var panels = [ document.getElementById(from), document.getElementById(to) ];
//     if (window.widget) {
//         widget.prepareForTransition(to=="front" ? "ToFront" : "ToBack");
//     }
//     panels[0].style.visibility = 'hidden';
//     panels[1].style.visibility = 'visible';
//     if (window.widget) setTimeout("widget.performTransition();", 0);
// }
