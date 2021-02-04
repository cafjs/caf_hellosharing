'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

class Answer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'okId'},
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.ControlLabel, null, 'Last answer: Correct!')
                       ),
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.FormControl, {
                            type: 'text',
                            value: this.props.theAnswer,
                            readOnly: true
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'iterId'},
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.ControlLabel, null,
                           '# of asynchronous fInv(f(42))')
                       ),
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.FormControl, {
                            type: 'text',
                            value: this.props.iterations,
                            readOnly: true
                        })
                       )
                    )
                 );
    }
}

module.exports = Answer;
