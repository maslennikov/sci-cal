'use strict';

window.App = window.App || {};

App.SciCal = Backbone.Model.extend({
    defaults: {
        panelvalue: '',       // Value displayed in the panel
        errorvalue: '',       // Value displayed in the error panel
        paneloffset: 0,       // How far in from the right we've cursored in
        drg: 0                // 0 - degrees, 1 - radians, 2 - gradians
    }
});

App.SciCal.prototype.PI = function() {
    return Math.PI;
};

App.SciCal.prototype.E = function() {
    return Math.E;
};

App.SciCal.prototype.pow = function(val, base) {
    return Math.pow(val,base);
};

App.SciCal.prototype.utf8 = function(val) {
    return "\""+String.fromCharCode(val)+"\"";
};

App.SciCal.prototype.log = function(val) {
    return Math.log(val);
};

App.SciCal.prototype.abs = function(val) {
    return Math.abs(val);
};

App.SciCal.prototype.sin = function(val) {
    return Math.sin(this.trig(val));
};

App.SciCal.prototype.cos = function(val) {
    return Math.cos(this.trig(val));
};

App.SciCal.prototype.tan = function(val) {
    return Math.tan(this.trig(val));
};

App.SciCal.prototype.asin = function(val) {
    return this.atrig(Math.asin(val));
};

App.SciCal.prototype.acos = function(val) {
    return this.atrig(Math.acos(val));
};

App.SciCal.prototype.atan = function(val) {
    return this.atrig(Math.atan(val));
};

App.SciCal.prototype.sqrt = function(val) {
    return Math.sqrt(val);
};

App.SciCal.prototype.cbrt = function(val) {
    return Math.sqrt(Math.sqrt(val));
};

App.SciCal.prototype.hex = function(val) {
    return this.base(val, 16);
};

App.SciCal.prototype.oct = function(val) {
    return this.base(val, 8);
};

App.SciCal.prototype.bin = function(val) {
    return this.base(val, 2);
};

App.SciCal.prototype.base = function(val, base) {
    var num = parseFloat(val);
    if (num != Math.floor(num)) throw "Not an Integer";
    var prefix = num < 0 ? "-" : "";
    prefix += base == 16 ? "0x"
        : base == 8 ? "0"
        : base == 2 ? "%"
        : base == 10 ? ""
        : "?";
    return prefix + Math.abs(num).toString(base);
};

/**
 * Convert value from current mode to radians
 */
App.SciCal.prototype.trig = function(val, fromDrg) {
    if (fromDrg == undefined) {
        fromDrg = this.drg;
    }

    switch (fromDrg) {
    case 0:
        return (val % 360) * Math.PI / 180;
    case 1:
        return val % (Math.PI * 2);
    case 2:
        return (val % 400) / 200 * Math.PI;
    default:
        throw "Unknown base \"" + fromDrg + "\"";
    }
};

/**
 * Convert value from radians to current mode
 */
App.SciCal.prototype.atrig = function(val, toDrg) {
    if (toDrg == undefined) {
        toDrg = this.drg;
    }

    switch (toDrg) {
    case 0:
        return val * 180 / Math.PI;
    case 1:
        return val;
    case 2:
        return val * 200 / Math.PI;
    default:
        throw "Unknown base \"" + toDrg + "\"";
    }
};

App.SciCal.prototype.fix = function(val) {
    if (isNaN(val)) throw "Not A Number";
    return val;
};

App.SciCal.prototype.onButton = function(btn) {
    try {
        this._onButton(btn);
    } catch (err) {
        this.set({panelvalue: 'E', errorvalue: err, paneloffset: 0});
    }
};

App.SciCal.prototype.moveCursor = function(offset) {
    var text = this.get('panelvalue');
    this.set('paneloffset', Math.min(text.length, Math.max(0, offset)));
};

//todo shit is broken, change fields through set() method
App.SciCal.prototype._onButton = function(btn) {
    switch(btn) {
    case '':
        return;
    case "left":
        this.moveCursor(this.get('paneloffset') + 1);
        break;
    case "right":
        this.moveCursor(this.get('paneloffset') - 1);
        break;
    case "bs":
        this.onBackspace();
        break;
    case "clear":
        this.clear();
        break;
    case "plusminus":
        this.onPlusminus();
        break;
    case "pi":
        this.append("PI()");
        break;
    case "magice":
        this.append("E()");
        break;
    case "sqrt":
    case "cbrt":
    case "abs":
    case "log":
    case "sin":
    case "cos":
    case "tan":
    case "asin":
    case "acos":
    case "atan":
    case "hex":
    case "oct":
    case "bin":
    case "utf8":
        this.wrap(btn);
        break;
    case "pow":
        this.set('panelvalue', 'pow(', zero(this.get('panelvalue')) + ',)');
        this.set('paneloffset', 1);
        break;
    case 'drg':
        this.onDrg();
        break;
    case "eq":
        this.onEq();
        break;
    case "sub":
        this.append("-");
        break;
    case "add":
        this.append("+");
        break;
    case "mul":
        this.append("*");
        break;
    case "div":
        this.append("/");
        break;
    case "decimal":
        this.append(".");
        break;
    default:
        this.append(btn);
        break;
    }
};

App.SciCal.prototype.onDrg = function() {
    var expr = this.get('panelvalue');
    var oldDrg = this.get('drg');
    var newDrg = (oldDrg + 1) % 3;

    if (expr) {
        var val = this.myeval(expr);
        val = this.atrig(this.trig(val, oldDrg), newDrg);
        expr = this.fix(val).toString();
    }

    this.set({drg: newDrg, panelvalue: expr, errorvalue: ''});
};

App.SciCal.prototype.onEq = function() {
    var expr = this.get('panelvalue');
    var out = expr == "" ? "" : this.myeval(expr);
    this.set({panelvalue: out.toString(), errorvalue: ''});
};

App.SciCal.prototype.onBackspace = function() {
    var expr = this.get('panelvalue');
    var cursor = this.get('paneloffset');
    expr = expr.substring(0, expr.length - cursor - 1) +
        expr.substring(expr.length - cursor);

    cursor = Math.min(expr.length, cursor);
    this.set({panelvalue: expr, paneloffset: cursor, errorvalue: ''});
};

App.SciCal.prototype.onPlusminus = function() {
    var expr = this.get('panelvalue');
    expr = expr.charAt(0) == '-' ? expr.substring(1) : '-' + expr;
    this.set('panelvalue', expr);
};

App.SciCal.prototype.append = function(val) {
    var text = this.get('panelvalue');
    var cursor = this.get('paneloffset');
    text = text.substring(0, text.length - cursor)
        + val + text.substring(text.length - cursor);
    this.set('panelvalue', text);
};

App.SciCal.prototype.wrap = function(funcname) {
    this.set('panelvalue', funcname + '(' + zero(this.get('panelvalue')) + ')');
};

App.SciCal.prototype.clear = function() {
    this.set({panelvalue: '', errorvalue: '', paneloffset: 0});
};

function zero(val) {
   return val=="" ? "0" : val;
}


/**
 * Evaluate the value and return it as an integer. Handles binary base etc.
 */
App.SciCal.prototype.myeval = function(val) {
    var self = this;

    if (val=="") return 0;
    if (val=="E") return "E";
    val = val.toString();
    val = val.replace(/<[/]?[A-Za-z]*>/g,"");
    if (/%[01]*[23456789ABCDEF]/.test(val)) {
        throw "Illegal Binary Digit";
    }
    val = val.replace(/%([01]+)/g, function(m,p1){return parseInt(p1,2)});

    //quick and dirty: replace all function calls with method calls
    val = val.replace(/([\w]+)\(/g, 'self.$1(');
    val = eval(val);
    return val;
};
