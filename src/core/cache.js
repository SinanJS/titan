/**
 * Created by zpc on 2017/5/15.
 * 缓存系统
 */
define(["../core"], function (Ti) {
    var Cache = function () {
        this.cache = {};
    };
    Cache.uid = 1;
    Cache.prototype = {
        register: function (owner) {
            var account = owner.valueOf(Cache);
            if (typeof account != "string") {
                account = "ti_" + Cache.uid++;
                Object.defineProperty(owner, "valueOf", {
                    value: function (pick) {
                        if (pick === Cache) {
                            return account;
                        }
                        return valueOf.call(owner);
                    }
                });

            }
            //开辟缓存空间
            if (!this.cache[account]) {
                this.cache[account] = {};
            }
            return account;
        },
        set: function (owner, key, value) {
            var account = this.register(owner);
            var cache = this.cache[account];
            if (arguments.length == 2 && typeof key == "object") {
                if (Ti.isEmptyObject(cache)) {
                    cache = key;
                } else {
                    for (var prop in key) {
                        cache[prop] = key[prop];
                    }
                }
            } else if (arguments.length > 2 && typeof key == "string") {
                cache[key] = value;
            }
            return this;
        },
        get: function (owner, key) {
            var account = owner.valueOf(Cache);
            if (!account) {
                return false;
            }
            var cache = this.cache[account];
            if (typeof key == "string") {
                return cache[key];
            } else {
                return cache;
            }
        },
        access: function (fnName, owner, key, value) {
            if (fnName === "set" && owner) {
                return (typeof key == "string" && !!value) ? this.set(owner, key, value) : (typeof key === "object") ? this.set(owner, key) : false;
            } else if (fnName === "get" && owner) {
                return (typeof key == "string") ? this.get(owner, key) : this.get(owner);
            } else {
                return false;
            }

        },
        remove: function (owner, key) {
            var account = owner.valueOf(Cache);
            if (!account) {
                return false;
            }
            if (typeof key === "string") {
                delete this.cache[account][key];
                for (var val in this.cache[account]) {
                    if (!val) {
                        delete this.cache[account];
                    }
                }
            } else {
                delete this.cache[account];
            }
        },
        // 判断该owner是否缓存过数据
        hasData: function (owner) {
            if (owner.valueOf(Cache)) {
                return !Ti.isEmptyObject(this.cache[owner.valueOf(Cache)]);
            }
        }
    };
    var cache_global = new Cache();

    Ti.extend({
        setCache: function (owner, key, value) {
            return cache_global.access("set", owner, key, value);
        },
        getCache: function (owner, key) {
            return cache_global.access("get", owner, key);
        },
        removeCache: function (owner, key) {
            return cache_global.remove(owner, key);
        },
        cache: function () {
            return cache_global.cache;
        },
        hasData: function (owner) {
            return cache_global.hasData(owner);
        },

    });
    return Cache;
});