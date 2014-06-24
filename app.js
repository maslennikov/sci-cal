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
    if (isNaN(val)) {
        console.log('!!!!!!!!!!!!!');
        throw "Not A Number";
    }
    return val;
};

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
    this.errorvalue="";
    return val;
};

App.SciCal.prototype.onButton = function(btn) {
    try {
        this._onButton(btn);
    } catch (err) {
        this.panelvalue = "E";
        this.errorvalue = err;
        this.paneloffset = 0;
    }
};

//todo shit is broken, change fields through set() or save() method?
App.SciCal.prototype._onButton = function(btn) {
    switch(btn) {
    case '':
        return;
    case "left":
        this.paneloffset++;
        if (this.paneloffset>this.panelvalue.length) this.paneloffset--;
        break;
    case "right":
        this.paneloffset--;
        if (this.paneloffset<0) this.paneloffset=0;
        break;
    case "bs":
        this.panelvalue = this.panelvalue.substring(0, this.panelvalue.length-this.paneloffset-1) + this.panelvalue.substring(this.panelvalue.length-this.paneloffset);
        if (this.panelvalue=="") {
            this.panelvalue="";
            this.errorvalue="";
        }
        if (this.paneloffset > this.panelvalue.length) this.paneloffset--;
        break;
    case "clear":
        this.panelvalue = "";
        this.errorvalue = "";
        this.paneloffset=0;
        break;
    case "plusminus":
        if (this.panelvalue.charAt(0)=='-') {
            this.panelvalue = this.panelvalue.substring(1);
        } else {
            this.panelvalue = "-"+this.panelvalue;
        }
        break;
    case "pi":
        this.append("PI()");
        break;
    case "magice":
        this.append("E()");
        break;
    case "sqrt":
        this.panelvalue = "sqrt("+zero(this.panelvalue)+")";
        break;
    case "cbrt":
        this.panelvalue = "cbrt("+zero(this.panelvalue)+")";
        break;
    case "abs":
        this.panelvalue = "abs("+zero(this.panelvalue)+")";
        break;
    case "log":
        this.panelvalue = "log("+zero(this.panelvalue)+")";
        break;
    case "sin":
        this.panelvalue = "sin("+zero(this.panelvalue)+")";
        break;
    case "cos":
        this.panelvalue = "cos("+zero(this.panelvalue)+")";
        break;
    case "tan":
        this.panelvalue = "tan("+zero(this.panelvalue)+")";
        break;
    case "asin":
        this.panelvalue = "asin("+zero(this.panelvalue)+")";
        break;
    case "acos":
        this.panelvalue = "acos("+zero(this.panelvalue)+")";
        break;
    case "atan":
        this.panelvalue = "atan("+zero(this.panelvalue)+")";
        break;
    case "pow":
        this.panelvalue = "pow("+zero(this.panelvalue)+",)";
        this.paneloffset = 1;
        break;
    case "hex":
        this.panelvalue = "hex("+zero(this.panelvalue)+")";
        break;
    case "oct":
        this.panelvalue = "oct("+zero(this.panelvalue)+")";
        break;
    case "bin":
        this.panelvalue = "bin("+zero(this.panelvalue)+")";
        break;
    case "utf8":
        this.panelvalue = "utf8("+zero(this.panelvalue)+")";
        break;
    case 'drg':
        var old = this.drg;
        this.drg = (old + 1) % 3;
        document.getElementById("display-mode").innerHTML =
            (['deg', 'rad', 'grad'])[this.drg];

        if (this.panelvalue) {
            var val = this.myeval(this.panelvalue);
            val = this.atrig(this.trig(val, old), this.drg);
            this.panelvalue = this.fix(val).toString();
        }
        break;
    case "eq":
        var out = this.panelvalue=="" ? "" : this.myeval(this.panelvalue);
        this.panelvalue = out.toString();
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

App.SciCal.prototype.append = function(val) {
    var text = this.panelvalue;
    this.panelvalue = text.substring(0, text.length - this.paneloffset)
        + val + text.substring(text.length - this.paneloffset);
};

function zero(val) {
   return val=="" ? "0" : val;
}
