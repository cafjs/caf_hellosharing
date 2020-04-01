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
var caf = require('caf_core');
var caf_comp = caf.caf_components;
var myUtils = caf_comp.myUtils;
var json_rpc = caf.caf_transport.json_rpc;
var util = require('util');
var setTimeoutPromise = util.promisify(setTimeout);

var app = require('../public/js/app.js');

var ADMIN_CA = 'admin';

var ADMIN_MAP = 'master';

var ANSWER = 42;

var NITER = 100;


var getRandomFunction = function(value, inverse) {
    return (inverse ?
            'return x - this.get("rand") - ' + value + ';' :
            'return x + this.get("rand") + ' + value + ';');
};

var isAdmin = function(self) {
    var name = self.__ca_getName__();
    return (json_rpc.splitName(name)[1] === ADMIN_CA);
};

var masterMap = function(self) {
    var name = self.__ca_getName__();
    return json_rpc.joinName(json_rpc.splitName(name)[0], ADMIN_CA, ADMIN_MAP);
};

exports.methods = {

    async __ca_init__() {
        this.state.iterations = 0;
        this.state.fullName = this.__ca_getAppName__()+ '#' +
            this.__ca_getName__();
        if (isAdmin(this)) {
            this.$.sharing.addWritableMap('master', ADMIN_MAP);
        }
        this.$.sharing.addReadOnlyMap('slave', masterMap(this));
        this.$.session.limitQueue(1); // only the last map change notification
        return [];
    },

    async __ca_pulse__() {
        var $$ = this.$.sharing.$;
        this.$.log && this.$.log.debug('calling PULSE!!! ');

        if (isAdmin(this)) {
            var x = Math.random();
            $$.master.setFun('f', ['x'], getRandomFunction(x));
            $$.master.setFun('fInv', ['x'], getRandomFunction(x, true));
            $$.master.set('rand', Math.random());
        }

        if ($$.slave && (typeof $$.slave.get('rand') === 'number')) {
            var answer = ANSWER;
            for (let n = 0 ; n < NITER; n++) {
                await setTimeoutPromise(1);
                answer = $$.slave.applyMethod('f', [answer]);
                await setTimeoutPromise(1);
                answer = $$.slave.applyMethod('fInv', [answer]);
            }
            this.state.iterations = this.state.iterations + NITER;
            this.state.theAnswer = answer;
            if (Math.abs(answer - ANSWER) > 0.0000001) {
                this.$.log && this.$.log.error('Race! ' + answer +
                                               ' not ' + ANSWER);
                this.state.error = 'BUG! Got a race, value: ' + answer;
            }
            this.$.session.notify([$$.slave.getVersion()]);

            try {
                var data = myUtils.extractData(await this.getStateImpl(null));
                this.$.react.render(app.main, [data]);
                return [];
            } catch (err) {
                return [err];
            }
        } else {
            return [];
        }
    },

    async hello(key) {
        this.$.react.setCacheKey(key);
        return this.getState(null);
    },

    async getStateImpl(version) {
        var $$ = this.$.sharing.$;
        if ($$.slave) {
            version = (version ? version : 0);
            var map = this.$.sharing.pullUpdate('slave', version);
            return [null, {state: this.state, map: map}];
        } else {
            return [new Error('Missing slave map')];
        }
    },

    async getState(version) {
        this.$.react.coin();
        return this.getStateImpl(version);
    }
};

caf.init(module);
