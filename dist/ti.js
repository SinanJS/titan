
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
                return str.replace(/(^\s*)|(\s*$)/g, "");
            }
        }
    });

    var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
    win.$f = win.Ti = Ti;

    return Ti;
});

/**
 * Created by zpc on 2017/5/15.
 * 缓存系统
 */
define('core/cache',["../core"], function (Ti) {
    var Cache = function () {
        this.cache = {};
    };
    Cache.uid = 1;
    Cache.prototype = {
        register: function (owner) {
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
            var account = this.register(owner);
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
            this.cache[account] = cache;
            return this;
        },
        get: function (owner, key) {
            var account = owner.valueOf(Cache);
            if (!account) {
                return false;
            }
            var cache = this.cache[account];
            if (key && typeof key == "string") {
                return cache[key];
            } else {
                return cache;
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
            var account = owner.valueOf(Cache);
            if (!account) {
                return false;
            }
            if (typeof key === "string") {
                delete this.cache[account][key];
                for (var val in this.cache[account]) {
                    if (!val) {
                        delete this.cache[account];
                    }
                }
            } else {
                delete this.cache[account];
            }
        },
        // 判断该owner是否缓存过数据
        hasData: function (owner) {
            if (owner.valueOf(Cache)) {
                return !Ti.isEmptyObject(this.cache[owner.valueOf(Cache)]);
            }
        }
    };
    var cache_global = new Cache();

    Ti.extend({
        setCache: function (owner, key, value) {
            return cache_global.access("set", owner, key, value);
        },
        getCache: function (owner, key) {
            return cache_global.access("get", owner, key);
        },
        removeCache: function (owner, key) {
            return cache_global.remove(owner, key);
        },
        cache: function () {
            return cache_global.cache;
        },
        hasData: function (owner) {
            return cache_global.hasData(owner);
        },

    });
    return Cache;
});
/**
 * Created by zpc on 2017/5/18.
 */
define('dom/velement',["../core"],function (Ti) {
    var VElement = function (tagName,props,children,textContent) {
        this.tagName = tagName;
        this.props = (typeof props == "object" && !Ti.isArray(props))?props : {};
        this.children = (children && Ti.isArray(children))?children:[];
        if(textContent){
            this.textContent = Ti.trim(textContent);
        }
    };
    VElement.prototype = {
        getAttr:function (name) {
            return this.props[name] || undefined;
        },
        setAttr:function (name,value) {
            try {
                this.props[name] = value;
            }catch (e){
                console.log(e);
            }
        },
        delAttr:function (name) {
            try{
                if(this.props[name]){
                    var prop = this.props[name];
                    delete this.props[name];
                    return prop;
                }else{
                    return "";
                }

            }catch (e){
                console.log(e);
            }
        },
        hasAttr:function (name) {
            return (name in this.props);
        }
    };
    return VElement;
});
/**
 * Created by zpc on 2017/5/19.
 */
define('dom/directive',[
    "../core",
    "./velement"
], function (Ti,VElement) {
    var drtUtils = {
        _data:{},
        prefix: "t",
        directives: {
            text: function (children,prop) {
                var text = drtUtils._data[prop].toString();
                console.log(text)
                var vEl = new VElement("#text",[],{},text);
                return [vEl];
            }
        },
        hocks: {},
        extend: function () {

        }

    };
    return drtUtils;
});
/**
 * Created by zpc on 2017/5/17.
 */
define('dom/vdom',["../core",
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
                            /* 将$data传给directive的具体方法
                            * 合理性改进，此处调用方式有待商榷
                            * 指令系统，实际上是在介入对当前VElement对象的children
                            * 修改未来渲染的children，实现绑定
                            * */
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
define('Ti',[
    "./core",
    "./core/cache",
    "./dom/vdom",
], function (Ti) {
    "use strict";
    return Ti;
});
