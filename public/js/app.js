"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var ReactServer = require('react-dom/server');
var AppSession = require('./session/AppSession');
var MyApp = require('./components/MyApp');
var AppActions = require('./actions/AppActions');
var redux = require('redux');
var AppReducer = require('./reducers/AppReducer');

var cE = React.createElement;
var SharedMap = require('caf_sharing').SharedMap;

var main = exports.main = function(data) {
    var ctx =  {
        store: redux.createStore(AppReducer),
        map : new SharedMap({debug: function(x) {
            console.log(x);
        }})
    };

    if (typeof window === 'undefined') {
        // server side rendering
        AppActions.initServer(ctx, data);
        return ReactServer.renderToString(cE(MyApp, {ctx: ctx}));
    } else {
        return AppSession.connect(ctx, function(err) {
            err && console.log('Cannot connect:' + err);
            // continue to render error if needed
            ReactDOM.render(cE(MyApp, {ctx: ctx}),
                            document.getElementById('content'));
        });
    }
};
