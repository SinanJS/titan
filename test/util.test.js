var expect = require('chai').expect;
var requirejs = require('requirejs');
var Injector = require('requirejs-mock').provide(requirejs);


// require.js环境配置，
// 配置参数与原有require.js一致
requirejs.config({
    baseUrl: "../src/",
    nodeRequire: require
});

describe('uitl工具集测试', function () {
    var injector;
    injector = Injector.create();
    var ti = injector.require('core/util');

    // 执行完所有测试用例之后调用
    after(function () {
        injector.destroy();
    });

    it('isArray数组', function () {
        expect(ti.isArray([1, 21, 13, 123])).to.be.ok;
        expect(ti.isArray([1, "sf", {}, 123])).to.be.ok;
        expect(ti.isArray("dsfsdfs")).to.not.be.ok;
        expect(ti.isArray({0:1,1:"dsff",length:2})).to.not.be.ok;
    });
    it('isArrayLike类数组', function () {
        expect(ti.isArrayLike([1, 21, 13, 123])).to.be.ok;
        expect(ti.isArrayLike([1, "sf", {}, 123])).to.be.ok;
        expect(ti.isArrayLike("dsfsdfs")).to.be.ok;
        expect(ti.isArrayLike({0:1,1:"dsff",length:2})).to.be.ok;
        expect(ti.isArrayLike({0:{},2:"xxx",1:"dsff",length:2})).to.be.ok;
    });
    it("手机号",function () {
        expect(ti.isPhone(13285626477)).to.be.ok;
        expect(ti.isPhone("13285626477")).to.be.ok;
        expect(ti.isPhone(132856264772)).to.not.be.ok;
        expect(ti.isPhone("132856264772")).to.not.be.ok;
        expect(ti.isPhone("12544469587")).to.not.be.ok;
        expect(ti.isPhone(12544469587)).to.not.be.ok;
        expect(ti.isPhone("010-265421-100")).to.not.be.ok;
        expect(ti.isPhone("aafasf45451219af")).to.not.be.ok;
    });
    /*it("固定电话",function () {
        expect(ti.isTel(13285626477)).to.not.be.ok;
        expect(ti.isTel("13285626477")).to.not.be.ok;
        expect(ti.isTel(132856264772)).to.not.be.ok;
        expect(ti.isTel("132856264772")).to.not.be.ok;
        expect(ti.isTel("12544469587")).to.not.be.ok;
        expect(ti.isTel(12544469587)).to.not.be.ok;
        expect(ti.isTel("010-10013")).to.be.ok;
        expect(ti.isTel("010-026-6427104")).to.be.ok;
        expect(ti.isTel("aaf-asf45-451219af")).to.not.be.ok;
    });*/
    it("迭代",function () {
        var after = [];
        ti.each("hello,world",function (index,item) {
            after.push(item);
        });
        expect(after[2]).to.be.equal("l");

        after = {};
        ti.each({
            a:1,
            b:"nihao"
        },function (index,item) {
            after[index]=item+1;
        });
        expect(after).to.be.deep.equal({a:2,b:"nihao1"});
    });
});