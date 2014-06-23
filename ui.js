window.JsCalc = new SciCal();

//todo[maslennikov] make it all in handlebars
var calcButtons = {
    // deg: {style: 'drg btn--grey', help: 'Set trignometric mode to degrees'},
    // rad: {style: 'drg btn--grey', help: 'Set trignometric mode to radians'},
    // grad: {style: 'drg btn--grey', help: 'Set trignometric mode to gradians'},
    drg: {style: 'drg btn--grey', help: 'Trignometric mode: degrees/radians/gradians'},
    info: {style: 'info', sym: 'i', help: 'Show the info panel'},
    hex: {style: 'base btn--grey', help: 'Convert expression to base 16'},
    oct: {style: 'base btn--grey', help: 'Convert expression to base 8'},
    bin: {style: 'base btn--grey', help: 'Convert expression to base 2'},
    utf8: {style: 'base btn--grey', help: 'Convert expression to UTF-8 character'},
    sin: {style: 'funcs btn--grey', help: 'Calculate sine of expression'},
    asin: {style: 'funcs btn--grey', sym: 'sin<sup>-1</sup>', help: 'Calculate the inverse sine of expression'},
    sqrt: {style: 'funcs btn--grey', sym: '&radic;', help: 'Calculate the square root of expression'},
    abs: {style: 'funcs btn--grey', help: 'Calculate the absolute value expression'},
    cos: {style: 'funcs btn--grey', help: 'Calculate the co-sine of expression'},
    acos: {style: 'funcs btn--grey', sym: 'cos<sup>-1</sup>', help: 'Calculate the inverse co-sine of expression'},
    cbrt: {style: 'funcs btn--grey', sym: '<sup style="margin-right:-2pt">3</sup>&radic;', help: 'Calculate the cube root of expression'},
    pow: {style: 'funcs btn--grey', sym: 'x<sup>&nbsp;y</sup>', help: 'Raise expression to the specified power'},
    tan: {style: 'funcs btn--grey', help: 'Calculate the tangent of expression'},
    atan: {style: 'funcs btn--grey', sym: 'tan<sup>-1</sup>', help: 'Calculate the inverse tangent of expression'},
    pi: {style: 'funcs btn--grey', sym: '&pi;', help: 'Insert the value of PI'},
    magice: {style: 'funcs btn--grey', sym: '<i>e</i>', help: 'Insert the natural logarithm value E'},
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
    plusminus: {style: 'digits', sym: '\u00B1'},
    decimal: {style: 'digits', sym: '.'},
    div: {style: 'basefuncs btn--grey', sym: '\u00F7'},
    mul: {style: 'basefuncs btn--grey', sym: '\u00D7'},
    sub: {style: 'basefuncs btn--grey', sym: '-'},
    add: {style: 'basefuncs btn--grey', sym: '+'},
    clear: {style: 'edit btn--orange', sym: 'AC', help: 'Clear the display (keypress: ESC)'},
    bs: {style: 'edit btn--orange', sym: '\u232B', help: 'Delete a character (keypress: Backspace)'},
    eq: {style: 'result', sym: '='}
};


//------------------------------------------------------------------------------
// These functions are all about creating the DOM
//------------------------------------------------------------------------------

document.addEventListener("keypress", eventKeyPress, true);
window.addEventListener("load", onLoad, true);

function onLoad() {
    draw();
}

function draw() {
    createButtons();
    document.getElementById("display-mode").innerHTML =
        (['deg', 'rad', 'grad'])[JsCalc.drg];
    doButton("clear");
}

function createButtons() {
    var btnSlots = document.querySelectorAll('.btn-slot');
    for (var i = 0; i < btnSlots.length; i++) {
        var slot = btnSlots[i];
        var id = slot.dataset.id;
        var props = calcButtons[id];
        if (props) {
            props.id = id;
            slot.appendChild(createButton(props));
        }
    }
}

function createButton(props) {
    var button = document.createElement('div');
    button.className = 'btn ' + (props.style || '');
    button.id = 'btn-' + props.id;
    if (props.help) {
        button.title = props.help;
    }

    var textWrapper = document.createElement('div');
    textWrapper.className = 'btn-text-wrapper';
    var text = document.createElement('div');
    text.className = 'btn-text';
    text.innerHTML = props.sym || props.id;
    textWrapper.appendChild(text);
    button.appendChild(textWrapper);

    button.addEventListener('click', function (e) {
        doButton(props.id);
    }, true);

    var wrapper = document.createElement('div');
    wrapper.className = 'btn-wrapper';
    wrapper.appendChild(button);
    return wrapper;
}


// Open a URL - how depends on whether we're a widget or not
function openURL(url) {
    if (window.widget) {
        window.widget.openURL(url);
    } else {
        location.href=url;
    }
}

function eventKeyPress(event) {
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
        doButton(key);
    }
}

function eventCopy(event) {
    event.clipboardData.setData('text/plain', JsCalc.panelvalue);
    event.preventDefault();
    event.stopPropagation();
}

function eventCut(event) {              // Likely to be Safari only
    event.clipboardData.setData('text/plain', JsCalc.panelvalue);
    event.preventDefault();
    event.stopPropagation();
    doButton("clear");
}

function eventPaste(event) {            // Likely to be Safari only
    JsCalc.panelvalue = event.clipboardData.getData('text/plain');
    JsCalc.panelvalue = JsCalc.panelvalue.replace(/,/g, '');
    event.preventDefault();
    event.stopPropagation();
    doButton("");
}


// Called whenever a button is pressed or clicked
//
function doButton(btn) {
//    window.status=btn;
    if (btn == 'info') {
        swapPanel("front", "back");
    } else {
        JsCalc.onButton(btn);
    }

    // Highlight the button by setting it's class list to "on"
    //
    var key = document.getElementById("btn-"+btn);
    if (key) {
        key.setAttribute("class", key.getAttribute("class")+" btn--down");
        setTimeout(function() { key.setAttribute("class", key.getAttribute("class").replace(/ btn--down$/,"")); }, 200);
    }

    // Update the panel
    //
    document.getElementById("display-error").innerHTML = JsCalc.errorvalue;
    document.getElementById("display-content").innerHTML = displayformat(JsCalc.panelvalue);
}



// Format the panelvalue for display - we insert the cursor at the right place
//
function displayformat(val) {
    val = val || "0";
    // val = zero(val);
    val = "&nbsp;"+val.substring(0, val.length - JsCalc.paneloffset) +
        "<span class=\"display-cursor\">" + (val[val.length - JsCalc.paneloffset] || "") +
        "</span>" + val.substring(val.length - JsCalc.paneloffset + 1);
    return val;
}

function swapPanel(from, to) {
    var panels = [ document.getElementById(from), document.getElementById(to) ];
    if (window.widget) {
        widget.prepareForTransition(to=="front" ? "ToFront" : "ToBack");
    }
    panels[0].style.visibility = 'hidden';
    panels[1].style.visibility = 'visible';
    if (window.widget) setTimeout("widget.performTransition();", 0);
}
