'use strict';

window.App = window.App || {};

/**
 * Calculator arithmetic engine
 */
App.SciCalEngine = function() {
    this.drg = 0;
};


App.SciCalEngine.prototype.constant = (function() {
    //creating a closure to keep constants private
    var constants = {
        Pi: Math.PI,
        e: Math.E
    };

    return function(id) {
        var value = constants[id];

        if (typeof value != 'number') {
            throw Error('Undefined identifier: ', id);
        }
        return value;
    };
})();

App.SciCalEngine.prototype.sum = function(a, b) {
    return a + b;
};

App.SciCalEngine.prototype.diff = function(a, b) {
    return a - b;
};

App.SciCalEngine.prototype.mul = function(a, b) {
    return a * b;
};

App.SciCalEngine.prototype.div = function(a, b) {
    return a / b;
};

App.SciCalEngine.prototype.pow = function(base, exp) {
    return Math.pow(base, exp);
};

App.SciCalEngine.prototype.utf8 = function(val) {
    return '"' + String.fromCharCode(val) + '"';
};

App.SciCalEngine.prototype.log = function(val) {
    return Math.log(val);
};

App.SciCalEngine.prototype.abs = function(val) {
    return Math.abs(val);
};

App.SciCalEngine.prototype.sin = function(val) {
    return Math.sin(this.drgToRad(val));
};

App.SciCalEngine.prototype.cos = function(val) {
    return Math.cos(this.drgToRad(val));
};

App.SciCalEngine.prototype.tan = function(val) {
    return Math.tan(this.drgToRad(val));
};

App.SciCalEngine.prototype.asin = function(val) {
    return this.radToDrg(Math.asin(val));
};

App.SciCalEngine.prototype.acos = function(val) {
    return this.radToDrg(Math.acos(val));
};

App.SciCalEngine.prototype.atan = function(val) {
    return this.radToDrg(Math.atan(val));
};

App.SciCalEngine.prototype.sqrt = function(val) {
    return Math.sqrt(val);
};

App.SciCalEngine.prototype.cbrt = function(val) {
    return Math.pow(val, 1/3);
};

App.SciCalEngine.prototype.hex = function(val) {
    return this.base(val, 16);
};

App.SciCalEngine.prototype.oct = function(val) {
    return this.base(val, 8);
};

App.SciCalEngine.prototype.bin = function(val) {
    return this.base(val, 2);
};

App.SciCalEngine.prototype.base = function(val, base) {
    var num = parseFloat(val);
    if (num != Math.floor(num)) throw "Not an Integer";

    var prefix = num < 0 ? "-" : "";
    prefix += base == 16 ? "0x"
        : base == 2 ? "0b"
        : base == 10 ? ""
        : "?";
    return prefix + Math.abs(num).toString(base);
};

/**
 * Convert value represented in the given drg mode to radians
 */
App.SciCalEngine.prototype.drgToRad = function(val, drg) {
    if (drg == undefined) {
        drg = this.drg;
    }

    switch (drg) {
    case 0:
        return (val % 360) * Math.PI / 180;
    case 1:
        return val % (Math.PI * 2);
    case 2:
        return (val % 400) / 200 * Math.PI;
    default:
        throw "Unknown base \"" + drg + "\"";
    }
};

/**
 * Convert value from radians to given drg mode
 */
App.SciCalEngine.prototype.radToDrg = function(val, drg) {
    if (drg == undefined) {
        drg = this.drg;
    }

    switch (drg) {
    case 0:
        return val * 180 / Math.PI;
    case 1:
        return val;
    case 2:
        return val * 200 / Math.PI;
    default:
        throw "Unknown base \"" + drg + "\"";
    }
};
