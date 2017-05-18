/**
 * Created by zpc on 2017/5/17.
 */
define(["../core",
        "../core/cache",
        "./velement"],
function (Ti, Cache,VElement) {
    
    var VDom = function (options) {
        this.el = options.el;
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
        this.options = options;
        this.init();
    };
    VDom.prototype = {
        init:function () {
            this.scanRealDom(this.$el);
        },
        // 扫描el下的真实DOM结构，生成基本VDOM树
        //https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
        scanRealDom:function ($el) {
            var i = 0;
            for(;i<$el.childNodes.length;i++){
                var childNode = $el.childNodes[i];
                var v_node = "";
                switch (childNode.nodeType){
                    // 元素节点
                    case 1:
                        var tagName = childNode.tagName.toLocaleLowerCase();
                        var props = {};
                        var attrs = childNode.attributes;
                        var children = [];
                        for(var j = 0;j<attrs.length;j++){
                            props[attrs[j].nodeName] = attrs[j].nodeValue;
                        }
                        // 子孙
                        if(childNode.childNodes.length>0){
                            for(var c = 0;c<childNode.childNodes.length;c++){
                                // 递归生成虚拟dOM
                                children.push(this.scanRealDom(childNode.childNodes[c]));
                            }
                        }
                        v_node = new VElement(tagName,props,children);
                        return v_node;
                        break;
                    // 文本节点
                    case 3:
                        break;
                    // 注释节点
                    case 8:
                        break;
                    // document节点
                    case 9:
                        break;
                }

            }
        },
        render:function () {

        },
    }
    
    Ti.render = function (options) {
        return new VDom(options);
    }
});