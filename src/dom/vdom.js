/**
 * Created by zpc on 2017/5/17.
 */
define(["../core",
        "../core/cache",
        "./velement",
        "./directive"
    ],
    function (Ti, Cache, VElement, drtUtils) {
        Ti.vDom = {};
        var VDom = function (options) {
            this.el = options.el;
            this.$el = document.querySelector(options.el);
            this.$data = options.data;
            return this.init();
        };
        VDom.prototype = {
            constructor: VDom,
            init: function () {
                var vDomTree = this._scanRealDom(this.$el);
                var cacheKey = "";
                if (this.el[0] === "#") {
                    cacheKey = "id_" + this.el.split("#")[1];
                } else if (this.el[0] === ".") {
                    cacheKey = "className_" + this.el.split(".")[1];
                } else {
                    cacheKey = this.el;
                }
                //将虚拟DOM树存入缓存
                Ti.setCache(Ti.vDom, cacheKey, vDomTree);

                console.log(this._render(vDomTree));
                // vDomTree = null;
            },
            // 扫描el下的真实DOM结构，生成基本VDOM树
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
            _scanRealDom: function ($el) {
                switch ($el.nodeType) {
                    // 元素节点
                    case 1:
                        var tagName = $el.tagName.toLocaleLowerCase();
                        var props = {};
                        var attrs = $el.attributes;
                        var children = [];
                        // 获取节点属性
                        for (var j = 0; j < attrs.length; j++) {
                            props[attrs[j].nodeName] = attrs[j].nodeValue;
                        }
                        // 子孙
                        if ($el.childNodes.length > 0) {
                            for (var c = 0; c < $el.childNodes.length; c++) {
                                // 递归生成虚拟dOM
                                var vn = this._scanRealDom($el.childNodes[c]);
                                if (vn) {
                                    children.push(vn);
                                }
                            }
                        }
                        v_node = new VElement(tagName, props, children);
                        return v_node;
                        break;
                    // 文本节点
                    case 3:
                        return new VElement("#text", {}, [], $el.textContent);
                        break;
                    default:
                        return false;
                        break;
                }

            },
            //根据虚拟DOM树生成节点
            _createNode: function (vDomTree) {
                if (!vDomTree) {
                    return;
                }
                var _this = this;
                var _node;
                var tagName = vDomTree.tagName;
                var props = vDomTree.props;
                var children = vDomTree.children;
                var textContent = vDomTree.textContent || "";
                // 将$data值传给drtUtils;
                drtUtils._data = this.$data;
                if (vDomTree.tagName !== "#text") {
                    _node = document.createElement(tagName);
                    Ti.each(props, function (name, prop) {
                        var arr = name.split("-");
                        if (arr && arr[0] == drtUtils.prefix) {
                            var drt = arr[1];
                            // 将$data传给directive的具体方法
                            children = drtUtils.directives[drt](children,prop);
                        }else{
                            _node.setAttribute(name, prop);
                        }
                    });

                    if (children.length > 0) {
                        var _this = this;
                        Ti.each(children, function (index, item) {
                            _node.appendChild(_this._createNode(item));
                        });
                    }
                } else {
                    _node = document.createTextNode(textContent);
                }
                return _node;
            },
            _render: function (vDomTree) {
                document.querySelector("#clone").appendChild(this._createNode(vDomTree));
            }
        };

        Ti.render = function (options) {
            return new VDom(options);
        };
        return VDom;
    });