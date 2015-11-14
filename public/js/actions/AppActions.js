var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var AppSession = require('../session/AppSession');
var json_rpc = require('caf_transport').json_rpc;

var updateF = function(data) {
    var d = {
        actionType: AppConstants.APP_UPDATE,
        data: data
    };
    AppDispatcher.dispatch(d);
};

var errorF =  function(err) {
    var d = {
        actionType: AppConstants.APP_ERROR,
        error: err
    };
    AppDispatcher.dispatch(d);
};

var getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

var notifyF = function(message) {
    var d = {
        actionType: AppConstants.APP_NOTIFICATION,
        mapVersion: getNotifData(message)
    };
    AppDispatcher.dispatch(d);
};

var wsStatusF =  function(isClosed) {
    var d = {
        actionType: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    AppDispatcher.dispatch(d);
};

var AppActions = {
    initServer: function(initialData) {
        updateF(initialData);
    },
    init: function(cb) {
        AppSession.hello(AppSession.getCacheKey(),
                         function(err, data) {
                             if (err) {
                                 errorF(err);
                             } else {
                                 updateF(data);
                             }
                             cb(err, data);
                         });
    },
    getRemoteState: function(version) {
        AppSession.getState(version, function(err, data) {
            if (err) {
                errorF(err);
            } else {
                updateF(data);
            }
        });
    },
    setLocalAnswer: function(answer) {
        updateF({state : {localAnswer: answer}});
    },
    resetError: function() {
        errorF(null);
    }
};

AppSession.onmessage = function(msg) {
    console.log('message:' + JSON.stringify(msg));
    notifyF(msg);
};

AppSession.onclose = function(err) {
    console.log('Closing:' + JSON.stringify(err));
    wsStatusF(true);
};


module.exports = AppActions;
