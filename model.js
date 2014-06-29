'use strict';

window.App = window.App || {};

App.SciCal = Backbone.Model.extend({
    defaults: {
        panelvalue: '',       // Value displayed in the panel
        errorvalue: '',       // Value displayed in the error panel
        paneloffset: 0,       // How far in from the right we've cursored in
        drg: 0                // 0 - degrees, 1 - radians, 2 - gradians
    },

    initialize: function() {
        var self = this;
        this._engine = new App.SciCalEngine();
        this.on('change:drg', function() {
            self._engine.drg = self.get('drg');
        });
    }
});


App.SciCal.prototype.onButton = function(btn) {
    try {
        this._onButton(btn);
    } catch (err) {
        this.set({
            panelvalue: 'E',
            errorvalue: err.html || err.message || err,
            paneloffset: 0});
    }
};

App.SciCal.prototype.moveCursor = function(offset) {
    var text = this.get('panelvalue');
    this.set('paneloffset', Math.min(text.length, Math.max(0, offset)));
};

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
        this.append("PI");
        break;
    case "magice":
        this.append("E");
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
        this.wrap(btn + '(', ')');
        break;
    case "pow":
        this.wrap('(', ')^');
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
    var oldDrg = this.get('drg');
    var newDrg = (oldDrg + 1) % 3;

    var val = this.myeval(this.get('panelvalue'));

    if (typeof val == 'number') {
        val = this._engine.radToDrg(this._engine.drgToRad(val, oldDrg), newDrg);
    }

    this.set({drg: newDrg, panelvalue: val + '', errorvalue: ''});
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

App.SciCal.prototype.wrap = function(prefix, postfix) {
    this.set('panelvalue', prefix + (this.get('panelvalue') || '0') + postfix);
};

App.SciCal.prototype.clear = function() {
    this.set({panelvalue: '', errorvalue: '', paneloffset: 0});
};



/**
 * Evaluate the value and return it as an integer. Handles binary base etc.
 */
App.SciCal.prototype.myeval = function(val) {
    var self = this;

    if (val === '') return '';
    if (val == 'E') return "E";
    val = val.toString();

    return this._reduceExpressionTree(grammar.parse(val));
};

/**
 * Reduce arithmetic expression tree down to the final value
 */
App.SciCal.prototype._reduceExpressionTree = function(node) {
    var self = this;

    if (typeof node != 'object') {
        throw new Error('internal error: malformed expression node: ' + node);
    }

    if (node.type == 'literal') {
        return node.value;
    }

    if (node.type == 'variable') {
        return this._engine.constant(node.value);
    }

    if (node.type == 'subexpr') {
        return this._reduceExpressionTree(node.value);
    }

    if (node.type == 'function') {
        var fn = this._engine[node.value];
        if (typeof fn != 'function') {
            throw new Error('undefined function: ' + node.value);
        }

        return fn.apply(this._engine, (node.args || []).map(function(arg) {
            return self._reduceExpressionTree(arg);
        }));
    }

    throw new Error('internal error: unknown node type: ' + node.type);
};
