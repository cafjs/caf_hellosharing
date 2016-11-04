var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var prettyPrintFun = function(x) {
    if (x && (typeof x === 'object') && (typeof x.type === 'string')) {
        var res = 'function(' + x.args.join(',') + ') {\n    ' +
                x.body + '\n}';
        return cE('pre', null, cE('code', null, res));
    } else {
        return x;
    }
};
var CachedMap = {

    oldMap: null,

    shouldComponentUpdate: function(nextProps, nextState) {
        var newMap = nextProps.map && nextProps.map.toImmutableObject();
        return (this.oldMap !== newMap);
    },

    render: function() {
        this.oldMap = this.props.map && this.props.map.toImmutableObject();
        var map = (this.oldMap  && this.oldMap.toObject()) || {};
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', null,
                     cE('tr', null,
                        cE('th', null, 'Property'),
                        cE('th', null, 'Value')
                       )
                    ),
                  cE('tbody', null,
                     cE('tr', null,
                        cE('td', null, '__ca_version__'),
                        cE('td', null, map.__ca_version__)
                       ),
                     cE('tr', null,
                        cE('td', null, 'f'),
                        cE('td', null, prettyPrintFun(map.f))
                       ),
                     cE('tr', null,
                        cE('td', null, 'fInv'),
                        cE('td', null, prettyPrintFun(map.fInv))
                       ),
                     cE('tr', null,
                        cE('td', null, 'rand'),
                        cE('td', null, map.rand)
                       )
                    )
                 );
    }
};


module.exports = React.createClass(CachedMap);
