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
