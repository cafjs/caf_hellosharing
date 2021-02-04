const AppConstants = require('../constants/AppConstants');
const json_rpc = require('caf_transport').json_rpc;

const updateF = function(store, state, map) {
    const d = {
        type: AppConstants.APP_UPDATE,
        state: state,
        map: map
    };
    store.dispatch(d);
};

const errorF =  function(store, err) {
    const d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

const getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

const wsStatusF =  function(store, isClosed) {
    const d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

const AppActions = {
    initServer(ctx, initialData) {
        ctx.map.applyChanges(initialData.map);
        updateF(ctx.store, initialData.state, ctx.map);
    },
    async init(ctx) {
        try {
            const data = await ctx.session.hello(ctx.session.getCacheKey())
                  .getPromise();
            if (data.map) {
                ctx.map.applyChanges(data.map);
                updateF(ctx.store, data.state, ctx.map);
            } else {
                const err = new Error(
                    "Missing primary map, initialize the 'admin' CA first"
                );
                errorF(ctx.store, err);
            }
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    async getRemoteState(ctx) {
        try {
            const data = await ctx.session.getState(ctx.map.getVersion())
                  .getPromise();
            if (data.map) {
                ctx.map.applyChanges(data.map);
                updateF(ctx.store, data.state, ctx.map);
            } else {
                const err = new Error(
                    "Missing primary map, initialize the 'admin' CA first"
                );
                errorF(ctx.store, err);
            }
        } catch (ex) {
            errorF(ctx.store, ex);
        }
    },
    message(ctx, msg) {
        const mapVersion = getNotifData(msg);
        if (mapVersion >= ctx.map.getVersion()) {
            AppActions.getRemoteState(ctx);
        }
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError(ctx) {
        errorF(ctx.store, null);
    },
    setError(ctx, err) {
        errorF(ctx.store, err);
    }
};

module.exports = AppActions;
