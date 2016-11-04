var AppConstants = require('../constants/AppConstants');
var objectAssign = require('object-assign');
var redux = require('redux');

var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {iterations: 0, theAnswer: 42, isClosed: false};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            var map = (action.map ? {map: action.map} : {});
            return objectAssign({}, state, action.state, map);
        case AppConstants.APP_ERROR:
            return objectAssign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return objectAssign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
