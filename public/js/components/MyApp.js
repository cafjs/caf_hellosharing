var React = require('react');
var rB = require('react-bootstrap');
var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var AppStatus = require('./AppStatus');
var NewError = require('./NewError');
var CachedMap = require('./CachedMap');

var cE = React.createElement;

var MyApp = {
    getInitialState: function() {
        return AppStore.getState();
    },
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },
    _onChange : function(ev) {
        this.setState(AppStore.getState());
    },
    doRefresh : function(ev) {
        ev.stopPropagation();
        var current = this.state.map && this.state.map.getVersion();
        AppActions.getRemoteState(current);
    },
    doCompute : function(ev) {
        ev.stopPropagation();
        if (this.state.map) {
            var answer = 42;
            var ref = this.state.map.ref();
            answer = ref.applyMethod('f',[answer]);
            answer = ref.applyMethod('fInv',[answer]);
            AppActions.setLocalAnswer(answer);
        }
    },
    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(NewError, {error: this.state.error}),
                  cE(rB.Panel, {header: cE(rB.Grid, null,
                                           cE(rB.Row, null,
                                              cE(rB.Col, {sm:1, xs:1},
                                                 cE(AppStatus, {
                                                        isClosed:
                                                        this.state.isClosed
                                                    })
                                                ),
                                              cE(rB.Col, {
                                                     sm: 5,
                                                     xs:10,
                                                     className: 'text-right'
                                                 },
                                                 "Sharing Actors Example"
                                                ),
                                              cE(rB.Col, {
                                                     sm: 5,
                                                     xs:11,
                                                     className: 'text-right'
                                                 },
                                                 this.state.fullName
                                                )
                                             )
                                          )
                               },
                     cE(rB.Panel, {header: "Answer to the Ultimate Question"},
                        cE(rB.Grid, null,
                           cE(rB.Row, null,
                              cE(rB.Col, {xs:12, sm:6},
                                 "Last Answer: Correct!"
                                ),
                              cE(rB.Col, {xs:12, sm:6},
                                 cE(rB.Input, {type: 'text', id: 'answer',
                                               readOnly: true,
                                               value: this.state.theAnswer,
                                               defaultValue: '?'})
                                )
                             ),
                           cE(rB.Row, null,
                              cE(rB.Col, {xs:12, sm:6},
                                 "Number of asynchronous fInv(f(42))"
                                ),
                              cE(rB.Col, { xs:12, sm: 6},
                                 cE(rB.Input, {type: 'text', id: 'iter',
                                               readOnly: true,
                                               value: this.state.iterations,
                                               defaultValue: 'Iterations'})
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: "Locally Cached Map"},
                        cE(CachedMap, {map :this.state.map}),
                        cE(rB.Grid, null,
                           cE(rB.Row, null,
                              cE(rB.Col, {xs:12, sm:6},
                                 cE(rB.Button, {onClick: this.doCompute,
                                                bsStyle: 'primary'},
                                    'Compute local')
                                ),
                              cE(rB.Col, { xs:12, sm: 6},
                                 cE(rB.Input, {type: 'text', id: 'localAnswer',
                                               readOnly: true,
                                               value: this.state.localAnswer,
                                               defaultValue: '?'})
                                )
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
