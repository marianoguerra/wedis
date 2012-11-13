/*global define*/
(function (root, factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return (root.Wedis = factory());
        });
    } else {
        root.Wedis = factory();
    }
}(this, function () {
    "use strict";
    var
        OK = "OK",
        db = {};

    function Wedis(dbname) {
        this.dbname = dbname;

        if (db[dbname] === undefined) {
            db[dbname] = {};
        }

        this._db = db[dbname];
    }

    Wedis.prototype = {
        set: function (key, val) {
            this._db[key] = val;
            return OK;
        },
        // TODO: check that args lenght is even
        mset: function () {
            var key = null, that = this;

            [].slice.call(arguments).forEach(function (item) {
                if (key === null) {
                    key = item;
                } else {
                    that.set(key, item);
                    key = null;
                }
            });

            return OK;
        },
        get: function (key) {
            var result = this._db[key];

            return (result === undefined) ? null : result;
        },
        mget: function () {
            var that = this;
            return [].slice.call(arguments).map(function (key) {
                return that.get(key);
            });
        },
        exists: function (key) {
            return this._db[key] !== undefined;
        },
        hset: function (key, field, val) {
            var result;

            if (this._db[key] === undefined) {
                this._db[key] = {};
            }

            result = (this._db[key][field] === undefined) ? 0 : 1;

            this._db[key][field] = val;

            return result;
        },
        hexists: function (key, field) {
            return this._db[key] !== undefined && this._db[key][field] !== undefined;
        },
        // TODO: check that we are returning an object
        // TODO: clone it defensively?
        hgetall: function (key) {
            return this.get(key) || {};
        },
        hkeys: function (objkey) {
            var key, result = [];

            for (key in this.hgetall(objkey)) {
                result.push(key);
            }

            return result;
        },
        hvals: function (objkey) {
            var key, result = [], obj = this.hgetall(objkey);

            for (key in obj) {
                result.push(obj[key]);
            }

            return result;
        },
        hlen: function (key) {
            return this.hkeys(key).length;
        },
        hget: function (key, field) {
            if (this._db[key] === undefined) {
                return null;
            } else if (this._db[key][field] === undefined) {
                return null;
            } else {
                return this._db[key][field];
            }
        },
        append: function (key, value) {
            var result;

            if (!this.exists(key)) {
                result = value.toString();
            } else {
                result = this.get(key).toString() + value.toString();
            }

            this.set(key, result);

            return result;
        },
        hdel: function () {
            var
                hash,
                count = 0,
                key = arguments[0],
                fields = [].slice.call(arguments, 1);

            hash = this._db[key];

            if (hash === undefined) {
                return count;
            } else {
                fields.forEach(function (field) {
                    if (hash[field] !== undefined) {
                        delete hash[field];
                        count += 1;
                    }
                });

                return count;
            }
        },
        hincrby: function (key, field, value) {
            var newValue = (this.hget(key, field) || 0) + value;
            this.hset(key, field, newValue);

            return newValue;
        },
        incr: function (key) {
            return this.incrby(key, 1);
        },
        incrby: function (key, value) {
            var newValue = (this.get(key) || 0) + value;
            this.set(key, newValue);

            return newValue;
        },
        decr: function (key) {
            return this.decrby(key, 1);
        },
        decrby: function (key, value) {
            return this.incrby(key, -value);
        },
        _clearDB: function (magicKey) {
            if (magicKey === "yes I really want it") {
                db[this.dbname] = {};
                this._db = db[this.dbname];
            }
        }
    };

    return {
        createClient: function () {
            return new Wedis(0);
        },
        Wedis: Wedis
    };
}));
