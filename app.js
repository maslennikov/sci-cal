'use strict';

/**
 * A calculator model
 */
function SciCal() {
    this.panelvalue = '';       // Value displayed in the panel
    this.errorvalue = '';       // Value displayed in the error panel
    this.paneloffset = 0;       // How far in from the right we've cursored in
    this.drg = 0;               // 0 - degrees, 1 - radians, 2 - gradians
}

SciCal.prototype.getDisplayText = function() {
    return this.panelvalue;
};

SciCal.prototype.setDisplayText = function(text) {
    //todo parsing stuff first?
    this.panelvalue = text;
};

SciCal.prototype.getErrorText = function() {
    return this.errorvalue;
};

SciCal.prototype.getCursorOffset = function() {
    return this.paneloffset;
};

SciCal.prototype.PI = function() {
    return Math.PI;
};

SciCal.prototype.E = function() {
    return Math.E;
};

SciCal.prototype.pow = function(val, base) {
    return Math.pow(val,base);
};

SciCal.prototype.utf8 = function(val) {
    return "\""+String.fromCharCode(val)+"\"";
};

SciCal.prototype.log = function(val) {
    return Math.log(val);
};

SciCal.prototype.abs = function(val) {
    return Math.abs(val);
};

SciCal.prototype.sin = function(val) {
    return Math.sin(this.trig(val));
};

SciCal.prototype.cos = function(val) {
    return Math.cos(this.trig(val));
};

SciCal.prototype.tan = function(val) {
    return Math.tan(this.trig(val));
};

SciCal.prototype.asin = function(val) {
    return this.atrig(Math.asin(val));
};

SciCal.prototype.acos = function(val) {
    return this.atrig(Math.acos(val));
};

SciCal.prototype.atan = function(val) {
    return this.atrig(Math.atan(val));
};

SciCal.prototype.sqrt = function(val) {
    return Math.sqrt(val);
};

SciCal.prototype.cbrt = function(val) {
    return Math.sqrt(Math.sqrt(val));
};

SciCal.prototype.hex = function(val) {
    return this.base(val, 16);
};

SciCal.prototype.oct = function(val) {
    return this.base(val, 8);
};

SciCal.prototype.bin = function(val) {
    return this.base(val, 2);
};

SciCal.prototype.base = function(val, base) {
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
SciCal.prototype.trig = function(val, fromDrg) {
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
SciCal.prototype.atrig = function(val, toDrg) {
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

SciCal.prototype.fix = function(val) {
    if (isNaN(val)) {
        console.log('!!!!!!!!!!!!!');
        throw "Not A Number";
    }
    return val;
};

/**
 * Evaluate the value and return it as an integer. Handles binary base etc.
 */
SciCal.prototype.myeval = function(val) {
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

SciCal.prototype.onButton = function(btn) {
    try {
        this._onButton(btn);
    } catch (err) {
        this.panelvalue = "E";
        this.errorvalue = err;
        this.paneloffset = 0;
    }
};

SciCal.prototype._onButton = function(btn) {
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

SciCal.prototype.append = function(val) {
    var text = this.panelvalue;
    this.panelvalue = text.substring(0, text.length - this.paneloffset)
        + val + text.substring(text.length - this.paneloffset);
};

function zero(val) {
   return val=="" ? "0" : val;
}
