const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

const prettyPrintFun = function(x) {
    if (x && (typeof x === 'object') && (typeof x.type === 'string')) {
        const res = 'function(' + x.args.join(',') + ') {\n    ' +
                x.body + '\n}';
        return cE('pre', null, cE('code', null, res));
    } else {
        return x;
    }
};

class CachedMap extends React.Component {

    constructor(props) {
        super(props);
        this.oldMap = null;
    }


    shouldComponentUpdate(nextProps, nextState) {
        const newMap = nextProps.map && nextProps.map.toImmutableObject();
        return (this.oldMap !== newMap);
    }

    render() {
        this.oldMap = this.props.map && this.props.map.toImmutableObject();
        const map = (this.oldMap  && this.oldMap.toObject()) || {};

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
                        cE('td', null, 'version'),
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

module.exports = CachedMap;
