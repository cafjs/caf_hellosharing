

var React = require('react');
var AppSession = require('./session/AppSession');
var MyApp = require('./components/MyApp');
var AppActions = require('./actions/AppActions');

var cE = React.createElement;

AppSession.onopen = function() {
    console.log('open session');
    React.render(
        cE(MyApp, null),
        document.getElementById('content')
    );
    AppActions.init();
};


var main = exports.main = function(data) {
    if (typeof window === 'undefined') {
        // server side rendering
        AppActions.init(data);
        return React.renderToString(cE(MyApp, null));
    } else {
        console.log('Hello');
        return null;
    }
};
