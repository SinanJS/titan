'use strict';
define([], function () {
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
        //callback参数：索引index,项目item
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
                for (var index in obj) {
                    isContinue = cb.call(obj[index], index, obj[index]);
                    if(isContinue == false){
                        break;
                    }
                }
            }
        },
        trim:function(str){
            if(typeof str==="string"){
                return str.replace(/^\s+|\s+$/g, '');
            }else {
                return str;
            }
        }
    });

    var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
    win.$f = win.Ti = Ti;

    return Ti;
});
