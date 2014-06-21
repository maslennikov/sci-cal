/**
 * Here goes all calculator-related stuff
 */

function PI()           { return Math.PI; }
function E()            { return Math.E; }
function pow(val,base)  { return Math.pow(val,base); }
function utf8(val)      { return "\""+String.fromCharCode(val)+"\""; }
function log(val)       { return Math.log(val); }
function abs(val)       { return Math.abs(val); }
function sin(val)       { return Math.sin(trig(val)); }
function cos(val)       { return Math.cos(trig(val)); }
function tan(val)       { return Math.tan(trig(val)); }
function asin(val)      { return atrig(Math.asin(val)); }
function acos(val)      { return atrig(Math.acos(val)); }
function atan(val)      { return atrig(Math.atan(val)); }
function sqrt(val)      { return Math.sqrt(val); }
function cbrt(val)      { return Math.sqrt(Math.sqrt(val)); }
function hex(val)       { return base(val,16); }
function oct(val)       { return base(val,8); }
function bin(val)       { return base(val,2); }
function base(val,base) {
    var num = parseFloat(val);
    if (num!=Math.floor(num)) throw "Not an Integer";
    return (num<0?"-":"")+(base==16?"0x":base==8?"0":base==2?"%":base==10?"":"?")+(Math.abs(num).toString(base));
}

/**
 * Convert value from current mode to radians
 */
function trig(val) {
    var mode = document.getElementById("display-mode").innerHTML;
    if (mode=="degrees")        val = (val%360)/180*Math.PI;
    else if (mode=="gradients") val = (val%400)/200*Math.PI;
    else if (mode=="radians")   val = (val%(Math.PI*2));
    else throw "Unknown base \""+mode+"\"";
    return val;
}

/**
 * Convert value from radians to current mode
 */
function atrig(val) {
    var mode = document.getElementById("display-mode").innerHTML;
    if (mode=="degrees")        val = val*180/Math.PI;
    else if (mode=="gradients") val = val*200/Math.PI;
    else if (mode=="radians") val = val;
    else throw "Unknown base \""+mode+"\"";
    return fix(val);
}

function fix(val) {
    if (isNaN(val)) throw "Not A Number";
    return val;
}

/**
 * Evaluate the value and return it as an integer. Handles binary base etc.
 */
function myeval(val) {
    if (val=="") return 0;
    if (val=="E") return "E";
    val = val.toString();
    val = val.replace(/<[/]?[A-Za-z]*>/g,"");
    if (/%[01]*[23456789ABCDEF]/.test(val)) {
        throw "Illegal Binary Digit";
    }
    val = val.replace(/%([01]+)/g, function(m,p1){return parseInt(p1,2)});
    val = eval(val);
    errorvalue="";
    return val;
}
