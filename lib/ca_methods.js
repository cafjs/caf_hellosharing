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
var json_rpc = caf.caf_transport.json_rpc;
var async = caf.async;

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

    '__ca_init__': function(cb) {
        this.state.iterations = 0;
        this.state.fullName = this.__ca_getAppName__()+ '#' +
            this.__ca_getName__();
        if (isAdmin(this)) {
            this.$.sharing.addWritableMap('master', ADMIN_MAP);
        }
        this.$.sharing.addReadOnlyMap('slave', masterMap(this));
        this.$.session.limitQueue(1); // only the last map change notification
        cb(null);
    },

    '__ca_pulse__': function(cb) {
        var $$ = this.$.sharing.$;
        var self = this;
        this.$.log && this.$.log.debug('calling PULSE!!! ');

        if (isAdmin(this)) {
            var x = Math.random();
            $$.master.setFun('f', ['x'], getRandomFunction(x));
            $$.master.setFun('fInv', ['x'], getRandomFunction(x, true));
            $$.master.set('rand', Math.random());
        }

        if ($$.slave && (typeof $$.slave.get('rand') === 'number')) {
            var answer = ANSWER;
            async.timesSeries(NITER, function (n, cb0) {
                async.series([
                    function(cb1) {
                        setTimeout(function() {
                            answer = $$.slave.applyMethod('f', [answer]);
                            cb1(null);
                        }, 1);
                    },
                    function(cb1) {
                        setTimeout(function() {
                            answer = $$.slave.applyMethod('fInv', [answer]);
                            cb1(null);
                        }, 1);
                    }
                ], cb0);
            }, function (err) {
                self.state.iterations = self.state.iterations + NITER;
                self.state.theAnswer = answer;
                if (Math.abs(answer - ANSWER) > 0.0000001) {
                    self.$.log && self.$.log.error('Race! ' + answer +
                                                   ' not ' + ANSWER);
                    self.state.error = 'BUG! Got a race, value: ' + answer;
                }
                self.$.session.notify([$$.slave.getVersion()]);
                if (err) {
                    cb(err);
                } else {
                    self.getStateImpl(null, function(error, data) {
                        if (error) {
                            cb(error);
                        } else {
                            self.$.react.render(app.main, [data]);
                            cb(null);
                        }
                    });
                }
            });
        } else {
            cb(null);
        }
    },

    'hello': function(key, cb) {
        this.$.react.setCacheKey(key);
        this.getState(null, cb);
    },

    'getStateImpl': function(version, cb) {
        var $$ = this.$.sharing.$;
        if ($$.slave) {
            version = (version ? version : 0);
            var map = this.$.sharing.pullUpdate('slave', version);
            cb(null, {state: this.state, map: map});
        } else {
            cb(new Error('Missing slave map'));
        }
    },

    'getState': function(version, cb) {
        this.$.react.coin();
        this.getStateImpl(version, cb);
    }
};

caf.init(module);
