'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Compute extends React.Component {

    constructor(props) {
        super(props);
        this.doCompute = this.doCompute.bind(this);
    }

    doCompute(ev) {
        if (this.props.map) {
            let answer = 42;
            const ref = this.props.map.ref();
            answer = ref.applyMethod('f',[answer]);
            answer = ref.applyMethod('fInv',[answer]);
            AppActions.setLocalState(this.props.ctx, {localAnswer: answer});
        }
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'answerId'},
                     cE(rB.Col, {sm: 6, xs: 12},
                         cE(rB.ControlLabel, null, 'Local Answer')
                       ),
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.FormControl, {
                            type: 'text',
                            value: this.props.localAnswer,
                            readOnly: true
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'computeId'},
                     cE(rB.Col, {smOffset: 6, sm: 6, xs: 12},
                        cE(rB.Button, {
                            onClick: this.doCompute,
                            bsStyle: 'primary'
                        }, 'Compute')
                       )
                    )
                 );
    }
}

module.exports = Compute;
