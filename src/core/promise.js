/**
 * Created by zpc on 2017/6/8.
 * Promise原生实现
 */
/*
 *3种状态
 * pending: 还没有得到肯定或者失败结果，进行中
 fulfilled: 成功的操作
 rejected: 失败的操作
 settled: 已被 fulfilled 或 rejected
 * */
define(["../core"], function (Ti) {
    var PENDING = 0;  // 进行中
    var FULFILLED = 1; // 成功
    var REJECTED = 2;  // 失败
    var Promise = function (fn) {
        // 状态机，存储上面3种状态
        this.state = PENDING;
        // 存储成功或失败的结果值
        this.value = null;

        // 存储回调函数，通过调用`.then`或者`.done`方法
        this.handlers = [];

        // 存储reject的回调函数
        this.rejectHandelers = [];


        // 异步任务成功后的处理
        var _this = this;

        function resolve(result) {
            if (_this.state === PENDING) {
                _this.state = FULFILLED;
                _this.value = result;
                for (var i = 0; i < _this.handlers.length; i++) {
                    _this.handlers[i](result); // 异步等待结束后，调用then里定义好的resolve函数
                }
            }
        }

        // 异步任务失败后的处理
        function reject(err) {
            if (_this.state === PENDING) {
                _this.state = REJECTED;
                _this.value = err;
                for (var i = 0; i < _this.rejectHandelers.length; i++) {
                    _this.rejectHandelers[i](err);  // 异步等待结束后，调用then里定义好的reject函数
                }
            }
        }

        try {
            fn && fn(resolve, reject);
        } catch (e) {
            reject(e);
        }
    };
    Promise.isPromise = function (obj) {
        return obj instanceof Promise;
    };
    Promise.prototype.then = function (onResolved, onRejected) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            var onResolvedFade = function (val) {
                try {
                    var result = onResolved ? onResolved(val) : val;
                } catch (e) {
                    onRejectedFade(e);
                }
                if (Promise.isPromise(result)) {
                    // 当回调函数返回值也是promise的时候
                    result.then(function (val) {
                        resolve(val);
                    });
                } else {
                    resolve(result);//改变状态，修改this.value
                }
            };
            var onRejectedFade = function (val) {
                var result = onRejected ? onRejected(val) : val;
                reject(result);//改变状态
            };
            // 将回调方法分别添加到数组中
            _this.handlers.push(onResolvedFade);
            _this.rejectHandelers.push(onRejectedFade);

            if (_this.state === FULFILLED) {
                onRejectedFade(_this.value);
            } else if (_this.state === REJECTED) {
                onRejectedFade(_this.value);
            }


        });

    };
    // catch 实际上就是对then的部分二次封装，处理reject状态下的回调。
    Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };

    Promise.all = function (arr) {
        if (!Array.isArray(arr) || !(arr instanceof Array)) {
            return new TypeError("the argument of Promise.all must be Array");
        }
        return new Promise(function (resolve, reject) {
            var values = [];
            var valIndex = [];

            function doPromise(index) {
                var canWeDo = true;
                if (Promise.isPromise(item)) {
                    item.then(function (val) {
                        // Promise执行结束后,且成功，状态变为resolved后，进入这里
                        values[index] = val; //保证返回值的顺序与arr的顺序一致
                        valIndex.push(index); //如果不是所有的项目都返回成功状态，则不准resolve
                        if (valIndex.length !== arr.length) {
                            canWeDo = false;
                        }
                        if (canWeDo) {
                            resolve(values);
                        }
                    }).catch(function (val) {
                        // Promise执行结束后,且失败，状态变为rejected后，进入这里
                        reject(val);
                    });
                } else {
                    valIndex.push(index);
                    values[index] = item;
                    if (valIndex.length !== arr.length) {
                        canWeDo = false;
                    }
                    if (canWeDo) {
                        resolve(values);
                    }
                }
            }

            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                doPromise(i, item);
            }

        });
    };
    Promise.race = function (arr) {
        return arr;
    };
    Promise.resolve = function (arr) {

    };
    Promise.reject = function () {

    };
    Ti.extend({
        Promise: Promise
    });
    return Promise;
});