var AppConstants = require('../constants/AppConstants');
var json_rpc = require('caf_transport').json_rpc;

var updateF = function(store, state, map) {
    var d = {
        type: AppConstants.APP_UPDATE,
        state: state,
        map: map
    };
    store.dispatch(d);
};

var errorF =  function(store, err) {
    var d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

var getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

var wsStatusF =  function(store, isClosed) {
    var d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

var AppActions = {
    initServer: function(ctx, initialData) {
        ctx.map.applyChanges(initialData.map);
        updateF(ctx.store, initialData.state, ctx.map);
    },
    init: function(ctx, cb) {
        ctx.session.hello(ctx.session.getCacheKey(), function(err, data) {
            if (err) {
                errorF(ctx.store, err);
            } else {
                ctx.map.applyChanges(data.map);
                updateF(ctx.store, data.state, ctx.map);
            }
            cb(err, data);
        });
    },
    getRemoteState: async function(ctx) {
        try {
            var data = await ctx.session.getState(ctx.map.getVersion())
                    .getPromise();
            ctx.map.applyChanges(data.map);
            updateF(ctx.store, data.state, ctx.map);
        } catch (ex) {
            errorF(ctx.store, ex);
        }
    },
    message:  function(ctx, msg) {
        var mapVersion = getNotifData(msg);
        if (mapVersion >= ctx.map.getVersion()) {
            AppActions.getRemoteState(ctx);
        }
    },
    closing:  function(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    setLocalState: function(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError: function(ctx) {
        errorF(ctx.store, null);
    },
    setError: function(ctx, err) {
        errorF(ctx.store, err);
    }
};

module.exports = AppActions;
