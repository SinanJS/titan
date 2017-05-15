
define('core',[], function () {
    var Ti = function (el) {
        return new Ti.init(el);
    };
    Ti.init = function (el) {
        this.element = el;
    };
    Ti.fn = Ti.prototype = Ti.init.prototype;

    Ti.fn.extend = Ti.extend = function (source) {
        for (var property in source) {
            Ti[property] = source[property];
        }
        return this;
    };
    Ti.extend({
        isArray: Array.isArray || function (arr) {
            // 鸭子类型判定
            if (!!arr && arr instanceof Array && typeof arr === "object" && !!typeof arr.length === 'number') {
                return true;
            } else {
                return false;
            }
        },
        isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        isArrayLike: function (obj) {
            var length = obj.length;
            if((obj.nodeType === 1 || typeof obj === 'string' || this.isArray(obj)) && length){
                return true;
            }else if(typeof obj === 'object' && length && length>=0 && length === Math.floor(length) && length < 4294967296){
                return true;
            }
        },
        // 默认中国手机11位号码
        isPhone: function (str) {
            var reg = /^1[34578]\d{9}$/;
            return (reg.test(str));
        },
        /* // 默认中国固定电话 区号+座机号码+分机号码
         isTel: function (str) {
         var reg = /0\d{2,3}-\d{5,9}|\d{2,3}-\d{5,9}/;
         return reg.test(str.toString());
         },*/

        isEmail: function (str) {
            var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
            return reg.test(str.toString());
        },

        noop: function () {
        },
        //迭代器，若回调函数返回false，则停止迭代
        each: function (obj, cb) {
            if (!obj) {
                return;
            }
            var isArray = this.isArrayLike(obj);
            var i = 0, isContinue;
            if (isArray) {
                for (; i < obj.length; i++) {
                    isContinue =  cb.call(obj[i], i, obj[i]);
                    if(isContinue == false){
                        break;
                    }
                }
            } else {
                for (var item in obj) {
                    isContinue = cb.call(obj[item], item, obj[item]);
                    if(isContinue == false){
                        break;
                    }
                }
            }
        }
    });

    var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
    win.$f = win.Ti = Ti;

    return Ti;
});

/**
 * Created by zpc on 2017/5/15.
 */
define('core/cache',["../core"], function (Ti) {
    var Cache = function () {
        this.cache = {};
    };
    Cache.uid = 1;
    Cache.prototype = {
        locker: function (owner) {
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
            var account = this.locker(owner);
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
            var cache = this.cache[account];
            if (arguments.length === 1) {
                return cache;
            } else if (arguments.length > 1) {
                return cache[key];
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

        }
    };
    var cache_global = new Cache();
    Ti.extend({
        setCache: function (owner, key, value) {
            return cache_global.access("set", owner, key, value);
        },
        getCache: function (owner, key) {
            return cache_global.access("get", owner, key);
        }
    });
    return Cache;
});
define('Ti',[
    "./core",
    "./core/cache"
], function (Ti) {
    "use strict";
    return Ti;
});
