var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var AppActions = require('../actions/AppActions');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var SharedMap = require('caf_sharing').SharedMap;

var CHANGE_EVENT = 'change';

var newAppStore = function() {

    var server = new EventEmitter2();

    var state = {iterations: 0, theAnswer: 42,
                 map : new SharedMap({debug: function(x) { console.log(x);}}),
                 isClosed: false};

    var that = {};

    var emitChange = function() {
        server.emit(CHANGE_EVENT);
    };

    that.addChangeListener = function(callback) {
        server.on(CHANGE_EVENT, callback);
    };

    that.removeChangeListener = function(callback) {
        server.removeListener(CHANGE_EVENT, callback);
    };

    that.getState = function() {
        return state;
    };

    var mixinState = function(newState) {
        if (newState) {
            Object.keys(newState)
                .forEach(function(key) { state[key] = newState[key]; });
        }
    };

    var updateMap = function(map) {
        if (map) {
            if (Array.isArray(map)) {
                state.map.applyChanges(map);
            } else {
                state.map.reset();
                state.map.applyChanges(map);
            }
        }
    };

    var f = function(action) {
        switch(action.actionType) {
        case AppConstants.APP_UPDATE:
            mixinState(action.data.state);
            updateMap(action.data.map);
            emitChange();
            break;
        case AppConstants.APP_NOTIFICATION:
            var current = state.map.getVersion();
            if (action.mapVersion >= current) {
                AppActions.getRemoteState(current);
            }
            break;
        case AppConstants.APP_ERROR:
            state.error = action.error;
            console.log('Error:' + action.error);
            emitChange();
            break;
        case AppConstants.WS_STATUS:
            state.isClosed = action.isClosed;
            emitChange();
            break;
        default:
            console.log('Ignoring '+ JSON.stringify(action));
        }
    };

    AppDispatcher.register(f);
    return that;
};

module.exports = newAppStore();
