/**
 * Created by zpc on 2017/5/17.
 */
define(["../core",
        "../core/cache",
        "./velement"],
function (Ti, Cache,VElement) {
    Ti.vDom = {};
    var VDom = function (options) {
        this.el = options.el;
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
        return this.init();
    };
    VDom.prototype = {
        init:function () {
            var vDomTree = this.scanRealDom(this.$el);
            var cacheKey = "";
            if(this.el[0]==="#"){
                cacheKey = "id_"+this.el.split("#")[1];
            }else if(this.el[0]==="."){
                cacheKey = "className_"+this.el.split(".")[1];
            }else {
                cacheKey = this.el;
            }
            Ti.setCache(Ti.vDom,cacheKey,vDomTree);

            console.log(this._render(vDomTree));
           // vDomTree = null;
        },
        // 扫描el下的真实DOM结构，生成基本VDOM树
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
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
                            var vn = this.scanRealDom($el.childNodes[c]);
                            if(vn){
                                children.push(vn);
                            }
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
        _createNode:function (vDomTree) {
            if(!vDomTree){
                return;
            }
            var _node;
            var tagName = vDomTree.tagName;
            var props = vDomTree.props;
            var children = vDomTree.children;
            var textContent = vDomTree.textContent || "";
            if(vDomTree.tagName!=="#text"){
                _node = document.createElement(tagName);
                for(var name in props){
                    _node.setAttribute(name,props[name]);
                }
                if(children.length>0){
                    var _this = this;
                    Ti.each(children,function (index,item) {
                        _node.appendChild(_this._createNode(item));
                    });
                }
            }else {
                _node = document.createTextNode(textContent);
            }
            return _node;
        },
        _render:function (vDomTree) {
            document.querySelector("#clone").appendChild(this._createNode(vDomTree));
        }
    }
    
    Ti.render = function (options) {
        return new VDom(options);
    }
});