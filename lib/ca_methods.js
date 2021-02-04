// Modifications copyright 2020 Caf.js Labs and contributors
/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const json_rpc = caf.caf_transport.json_rpc;
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const app = require('../public/js/app.js');

const ADMIN_CA = 'admin';
const ADMIN_MAP = 'primary';
const ANSWER = 42;
const NITER = 100;


const getRandomFunction = function(value, inverse) {
    return (inverse ?
            'return x - this.get("rand") - ' + value + ';' :
            'return x + this.get("rand") + ' + value + ';');
};

const isAdmin = function(self) {
    const name = self.__ca_getName__();
    return (json_rpc.splitName(name)[1] === ADMIN_CA);
};

const primaryMap = function(self) {
    const name = self.__ca_getName__();
    return json_rpc.joinName(json_rpc.splitName(name)[0], ADMIN_CA, ADMIN_MAP);
};

exports.methods = {

    async __ca_init__() {
        this.state.iterations = 0;
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        if (isAdmin(this)) {
            this.$.sharing.addWritableMap('primary', ADMIN_MAP);
        }
        this.$.sharing.addReadOnlyMap('replica', primaryMap(this),
                                      {bestEffort : true});
        this.$.session.limitQueue(1); // only the last map change notification
        return [];
    },

    async __ca_pulse__() {
        const $$ = this.$.sharing.$;
        this.$.log && this.$.log.debug('calling PULSE!!! ');

        if (isAdmin(this)) {
            const x = Math.random();
            $$.primary.setFun('f', ['x'], getRandomFunction(x));
            $$.primary.setFun('fInv', ['x'], getRandomFunction(x, true));
            $$.primary.set('rand', Math.random());
        }

        if ($$.replica && (typeof $$.replica.get('rand') === 'number')) {
            var answer = ANSWER;
            for (let n = 0 ; n < NITER; n++) {
                await setTimeoutPromise(1);
                answer = $$.replica.applyMethod('f', [answer]);
                await setTimeoutPromise(1);
                answer = $$.replica.applyMethod('fInv', [answer]);
            }
            this.state.iterations = this.state.iterations + NITER;
            this.state.theAnswer = answer;
            if (Math.abs(answer - ANSWER) > 0.0000001) {
                this.$.log && this.$.log.error('Race! ' + answer +
                                               ' not ' + ANSWER);
                this.state.error = 'BUG! Got a race, value: ' + answer;
            }
            this.$.session.notify([$$.replica.getVersion()]);

            const [err, data] = await this.getStateImpl(null);
            if (err) {
                this.$.log && this.$.log.debug('Error: ' +
                                               myUtils.errToPrettyStr(err));
            } else {
                this.$.react.render(app.main, [data]);
            }
        } else {
            // try again...
            this.$.sharing.addReadOnlyMap('replica', primaryMap(this),
                                          {bestEffort : true});
        }
        return [];
    },

    async hello(key) {
        key && this.$.react.setCacheKey(key);
        return this.getState(null);
    },

    async getStateImpl(version) {
        const $$ = this.$.sharing.$;
        if ($$.replica) {
            version = (version ? version : 0);
            const map = this.$.sharing.pullUpdate('replica', version);
            return [null, {state: this.state, map}];
        } else {
            return [null, {state: this.state}];
        }
    },

    async getState(version) {
        this.$.react.coin();
        return this.getStateImpl(version);
    }
};

caf.init(module);
