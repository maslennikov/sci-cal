/**
 * Here goes everything related to the app user interface
 */
window.JsCalc = {
    panelvalue: '',             // Value displayed in the panel
    errorvalue: '',             // Value displayed in the error panel
    paneloffset: 0              // How far in from the right we've cursored in
};

JsCalc.buttons = {
    deg: {style: 'drg', help: 'Set trignometric mode to degrees'},
    rad: {style: 'drg', help: 'Set trignometric mode to radians'},
    grad: {style: 'drg', help: 'Set trignometric mode to gradients'},
    info: {style: 'info', sym: 'i', help: 'Show the info panel'},
    hex: {style: 'base', help: 'Convert expression to base 16'},
    oct: {style: 'base', help: 'Convert expression to base 8'},
    bin: {style: 'base', help: 'Convert expression to base 2'},
    utf8: {style: 'base', help: 'Convert expression to UTF-8 character'},
    sin: {style: 'funcs', help: 'Calculate sine of expression'},
    asin: {style: 'funcs', sym: 'sin<sup>-1</sup>', help: 'Calculate the inverse sine of expression'},
    sqrt: {style: 'funcs', sym: '&radic;', help: 'Calculate the square root of expression'},
    abs: {style: 'funcs', help: 'Calculate the absolute value expression'},
    cos: {style: 'funcs', help: 'Calculate the co-sine of expression'},
    acos: {style: 'funcs', sym: 'cos<sup>-1</sup>', help: 'Calculate the inverse co-sine of expression'},
    cbrt: {style: 'funcs', sym: '<sup style="margin-right:-2pt">3</sup>&radic;', help: 'Calculate the cube root of expression'},
    pow: {style: 'funcs', sym: 'x<sup>&nbsp;y</sup>', help: 'Raise expression to the specified power'},
    tan: {style: 'funcs', help: 'Calculate the tangent of expression'},
    atan: {style: 'funcs', sym: 'tan<sup>-1</sup>', help: 'Calculate the inverse tangent of expression'},
    pi: {style: 'funcs', sym: '&pi;', help: 'Insert the value of PI'},
    magice: {style: 'funcs', sym: '<i>e</i>', help: 'Insert the natural logarithm value E'},
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
    div: {style: 'funcs', sym: '\u00F7'},
    mul: {style: 'funcs', sym: '\u00D7'},
    sub: {style: 'funcs', sym: '-'},
    add: {style: 'funcs', sym: '+'},
    clear: {style: 'erase', sym: 'AC', help: 'Clear the display (keypress: ESC)'},
    bs: {style: 'erase', sym: '\u232B', help: 'Delete a character (keypress: Backspace)'},
    eq: {style: 'result', sym: '='}
};


//------------------------------------------------------------------------------
// These functions are all about creating the DOM
//------------------------------------------------------------------------------

document.addEventListener("keypress", eventKeyPress, true);
window.addEventListener("load", onLoad, true);

function onLoad() {
    draw();
    document.getElementById("x").innerHTML = navigator.userAgent;
}

function draw() {
    createButtons();
    document.getElementById("display-mode").innerHTML="degrees";
    doButton("clear");
}

function createButtons() {
    var btnSlots = document.querySelectorAll('.keyslot');
    for (var i = 0; i < btnSlots.length; i++) {
        var slot = btnSlots[i];
        var id = slot.dataset.id;
        var props = JsCalc.buttons[id];
        if (props) {
            props.id = id;
            slot.appendChild(createButton(props));
        }
    }
}

function createButton(props) {
    var button = document.createElement('div');
    button.className = 'key ' + (props.style || '');
    button.innerHTML = props.sym || props.id;
    button.id = 'key' + props.id;
    if (props.help) {
        button.title = props.help;
    }

    button.addEventListener('click', function (e) {
        doButton(props.id);
    }, true);

    var wrapper = document.createElement('div');
    wrapper.className = 'key-wrapper';
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
    try {
        switch(btn) {
          case '':
            break;
          case "info":
            swapPanel("front", "back");
            return;
            break;
          case "left":
            JsCalc.paneloffset++;
            if (JsCalc.paneloffset>JsCalc.panelvalue.length) JsCalc.paneloffset--;
            break;
          case "right":
            JsCalc.paneloffset--;
            if (JsCalc.paneloffset<0) JsCalc.paneloffset=0
            break;
          case "bs":
            JsCalc.panelvalue = JsCalc.panelvalue.substring(0, JsCalc.panelvalue.length-JsCalc.paneloffset-1) + JsCalc.panelvalue.substring(JsCalc.panelvalue.length-JsCalc.paneloffset);
            if (JsCalc.panelvalue=="") {
                JsCalc.panelvalue="";
                JsCalc.errorvalue="";
            }
            if (JsCalc.paneloffset > JsCalc.panelvalue.length) JsCalc.paneloffset--;
            break;
          case "clear":
            JsCalc.panelvalue = "";
            JsCalc.errorvalue = "";
            JsCalc.paneloffset=0;
            break;
          case "plusminus":
            if (JsCalc.panelvalue.charAt(0)=='-') {
                JsCalc.panelvalue = JsCalc.panelvalue.substring(1);
            } else {
                JsCalc.panelvalue = "-"+JsCalc.panelvalue;
            }
            break;
          case "pi":
            append("PI()");
            break;
          case "magice":
            append("E()");
            break;
          case "sqrt":
            JsCalc.panelvalue = "sqrt("+zero(JsCalc.panelvalue)+")";
            break;
          case "cbrt":
            JsCalc.panelvalue = "cbrt("+zero(JsCalc.panelvalue)+")";
            break;
          case "abs":
            JsCalc.panelvalue = "abs("+zero(JsCalc.panelvalue)+")";
            break;
          case "log":
            JsCalc.panelvalue = "log("+zero(JsCalc.panelvalue)+")";
            break;
          case "sin":
            JsCalc.panelvalue = "sin("+zero(JsCalc.panelvalue)+")";
            break;
          case "cos":
            JsCalc.panelvalue = "cos("+zero(JsCalc.panelvalue)+")";
            break;
          case "tan":
            JsCalc.panelvalue = "tan("+zero(JsCalc.panelvalue)+")";
            break;
          case "asin":
            JsCalc.panelvalue = "asin("+zero(JsCalc.panelvalue)+")";
            break;
          case "acos":
            JsCalc.panelvalue = "acos("+zero(JsCalc.panelvalue)+")";
            break;
          case "atan":
            JsCalc.panelvalue = "atan("+zero(JsCalc.panelvalue)+")";
            break;
          case "pow":
            JsCalc.panelvalue = "pow("+zero(JsCalc.panelvalue)+",)";
            JsCalc.paneloffset = 1;
            break;
          case "hex":
            JsCalc.panelvalue = "hex("+zero(JsCalc.panelvalue)+")";
            break;
          case "oct":
            JsCalc.panelvalue = "oct("+zero(JsCalc.panelvalue)+")";
            break;
          case "bin":
            JsCalc.panelvalue = "bin("+zero(JsCalc.panelvalue)+")";
            break;
          case "utf8":
            JsCalc.panelvalue = "utf8("+zero(JsCalc.panelvalue)+")";
            break;
          case "rad":
          case "deg":
          case "grad":
            btn = btn=="rad" ? "radians" : btn=="grad" ? "gradients" : "degrees";
            if (JsCalc.panelvalue!="") JsCalc.panelvalue = trig(myeval(JsCalc.panelvalue));
            document.getElementById("display-mode").innerHTML = btn;
            if (JsCalc.panelvalue!="") JsCalc.panelvalue = atrig(JsCalc.panelvalue).toString();
            break;
          case "eq":
            var out = JsCalc.panelvalue=="" ? "" : myeval(JsCalc.panelvalue);
            JsCalc.panelvalue = out.toString();
            break;
          case "sub":
            append("-");
            break;
          case "add":
            append("+");
            break;
          case "mul":
            append("*");
            break;
          case "div":
            append("/");
            break;
          case "decimal":
            append(".");
            break;
          default:
            append(btn)
            break;
        }
    } catch (err) {
        JsCalc.panelvalue = "E";
        JsCalc.errorvalue = err;
    }

    // Highlight the button by setting it's class list to "on"
    //
    var key = document.getElementById("key"+btn);
    if (key) {
        key.setAttribute("class", key.getAttribute("class")+" on");
        setTimeout(function() { key.setAttribute("class", key.getAttribute("class").replace(/ on$/,"")); }, 100);
    }

    // Update the panel
    //
    document.getElementById("display-error").innerHTML = JsCalc.errorvalue;
    document.getElementById("display-content").innerHTML = displayformat(JsCalc.panelvalue);
}

// Add some content to the panel value at the panel offset
//
function append(val) {
    JsCalc.panelvalue = JsCalc.panelvalue.substring(0,JsCalc.panelvalue.length-JsCalc.paneloffset) + val + JsCalc.panelvalue.substring(JsCalc.panelvalue.length-JsCalc.paneloffset);
}

// Format the panelvalue for display - we insert the cursor at the right place
//
function displayformat(val) {
    val = zero(val);
    val = "&nbsp;"+val.substring(0, val.length - JsCalc.paneloffset) +
        "<span class=\"display-cursor\">" + (val[val.length - JsCalc.paneloffset] || "") +
        "</span>" + val.substring(val.length - JsCalc.paneloffset + 1);
    return val;
}

function zero(val) {
   return val=="" ? "0" : val;
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
