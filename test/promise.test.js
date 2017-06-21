var expect = require('chai').expect;
var PromiseSelf = require('../src/core/Promise_node');
// 触发器
function emit(sample_native, sample_frame) {
    sample_native(sample_frame);
}

describe('原生实现Promise对象测试', function () {


    after(function () {

    });
    it("then基础", function () {
        function sample_then_1(sample) {
            var p1 = new Promise(function (resolve, reject) {
                resolve("Success!");
            });

            p1.then(function (value) {
                sample(value);
            }, function (reason) {
                sample(reason);
            });
        }

        function sample_then_2(result) {
            var p2 = new PromiseSelf(function (resolve, reject) {
                resolve("Success!");
            });
            p2.then(function (value) {
                //console.log(value,result)
                expect(value).to.deep.equal(result);
            }, function (reason) {
                expect(reason).to.deep.equal(result);
            });
        }

        emit(sample_then_1, sample_then_2);
    });

    it("setTime", function (done) {
        function sample_setTime_1(sample) {
            var p1 = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve("Success!");
                }, 100);
            });

            p1.then(function (value) {
                sample(value);
            }, function (reason) {
                sample(reason);
            });
        }

        function sample_setTime_2(result) {
            var p2 = new PromiseSelf(function (resolve, reject) {
                setTimeout(function () {
                    resolve("Success!");
                }, 100);
            });
            p2.then(function (value) {
                expect(value).to.deep.equal(result);
                done();
            }, function (reason) {
                expect(reason).to.deep.equal(result);
                done();
            });
        }

        emit(sample_setTime_1, sample_setTime_2);
    });

    it("catch", function (done) {
        function sample_1(sample) {
            var a = 0;
            var p1 = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (a > 1) {
                        resolve(a + 1);
                    } else {
                        reject(a - 1);
                    }
                }, 100);
            });

            p1.then(function (value) {
                sample(value);
            }, function (reason) {
                sample(reason);
            });
        }

        function sample_2(result) {
            var a = 0;
            var p2 = new PromiseSelf(function (resolve, reject) {
                setTimeout(function () {
                    if (a > 1) {
                        resolve(a + 1);
                    } else {
                        reject(a - 1);
                    }
                }, 100);
            });
            p2.then(function (value) {
                expect(value).to.deep.equal(result);
                done();
            }, function (reason) {
                expect(reason).to.deep.equal(result);
                done();
            });
        }

        function sample_3(sample) {
            var a = 0;
            var p1 = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (a > 1) {
                        resolve(a + 1);
                    } else {
                        reject(a - 1);
                    }
                }, 100);
            });

            p1.catch(function () {
                sample(reason)
            });
        }

        function sample_4(result) {
            var a = 0;
            var p2 = new PromiseSelf(function (resolve, reject) {
                setTimeout(function () {
                    if (a > 1) {
                        resolve(a + 1);
                    } else {
                        reject(a - 1);
                    }
                }, 100);
            });
            p2.catch(function (reason) {
                expect(reason).to.deep.equal(result);
                done();
            });
        }

        emit(sample_1, sample_2);
        emit(sample_3, sample_4);
    });

    it("链式调用", function () {

    });
});