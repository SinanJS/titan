/**
 * Created by zpc on 2017/5/17.
 */
define(["../core","../core/cache"],function (Ti,Cache) {
    var VDom = function (options) {
        this.el = document.querySelector(options.el);
        this.$data = options.data;
        this.options = options;
    };
    /*
    * VDOM的几个工作阶段
    * 1.扫描预定义DOM结构
    * 2.解析指令，结合$data属性，构建VDOM Object
    * 3.将VDOM Object存入缓存
    * 4.渲染页面
    * */
    VDom.prototype = {

    };


    Ti.extend({
        render:function (options) {
            return new VDom(options);
        }
    });
    return VDom;
});