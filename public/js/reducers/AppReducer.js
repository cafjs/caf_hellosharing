const AppConstants = require('../constants/AppConstants');
const redux = require('redux');

const AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {iterations: 0, theAnswer: 42, isClosed: false, error: null,
                 localAnswer: '?'};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            const map = (action.map ? {map: action.map} : {});
            return Object.assign({}, state, action.state, map);
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
