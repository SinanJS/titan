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
        return this.init();
    };
    VDom.prototype = {
        init:function () {
            this.vdomTree = this.scanRealDom(this.$el);
        },
        // 扫描el下的真实DOM结构，生成基本VDOM树
        //https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
        scanRealDom:function ($el) {
            switch ($el.nodeType){
                // 元素节点
                case 1:
                    var tagName = $el.tagName.toLocaleLowerCase();
                    var props = {};
                    var attrs = $el.attributes;
                    var children = [];
                    for(var j = 0;j<attrs.length;j++){
                        props[attrs[j].nodeName] = attrs[j].nodeValue;
                    }
                    // 子孙
                    if($el.childNodes.length>0){
                        for(var c = 0;c<$el.childNodes.length;c++){
                            // 递归生成虚拟dOM
                            children.push(this.scanRealDom($el.childNodes[c]));
                        }
                    }
                    v_node = new VElement(tagName,props,children);
                    return v_node;
                    break;
                // 文本节点
                case 3:
                    return new VElement("#text",{},[],$el.textContent);
                    break;
                // 注释节点
                case 8:
                    return false;
                    break;
                // document节点
                case 9:
                    return false;
                    break;
                default:
                    return false;
                    break;
            }

        },
        render:function () {

        },
    }
    
    Ti.render = function (options) {
        return new VDom(options);
    }
});