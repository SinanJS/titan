;(function() {
var core, core_cache, dom_velement, dom_directive, dom_vdom, core_promise, Ti;
core = function () {
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
      if (!!arr && arr instanceof Array && typeof arr === 'object' && !!typeof arr.length === 'number') {
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
      if ((obj.nodeType === 1 || typeof obj === 'string' || this.isArray(obj)) && length) {
        return true;
      } else if (typeof obj === 'object' && length && length >= 0 && length === Math.floor(length) && length < 4294967296) {
        return true;
      }
    },
    // 默认中国手机11位号码
    isPhone: function (str) {
      var reg = /^1[34578]\d{9}$/;
      return reg.test(str);
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
          isContinue = cb.call(obj[i], i, obj[i]);
          if (isContinue == false) {
            break;
          }
        }
      } else {
        for (var index in obj) {
          isContinue = cb.call(obj[index], index, obj[index]);
          if (isContinue == false) {
            break;
          }
        }
      }
    },
    trim: function (str) {
      if (typeof str === 'string') {
        return str.replace(/^\s+|\s+$/g, '');
      } else {
        return str;
      }
    }
  });
  var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
  win.$f = win.Ti = Ti;
  return Ti;
}();
core_cache = function (Ti) {
  var Cache = function () {
    this.cache = {};
  };
  Cache.uid = 1;
  Cache.prototype = {
    register: function (owner) {
      var account = owner.valueOf(Cache);
      if (typeof account != 'string') {
        account = 'ti_' + Cache.uid++;
        Object.defineProperty(owner, 'valueOf', {
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
      if (arguments.length == 2 && typeof key == 'object') {
        if (Ti.isEmptyObject(cache)) {
          cache = key;
        } else {
          for (var prop in key) {
            cache[prop] = key[prop];
          }
        }
      } else if (arguments.length > 2 && typeof key == 'string') {
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
      if (key && typeof key == 'string') {
        return cache[key];
      } else {
        return cache;
      }
    },
    access: function (fnName, owner, key, value) {
      if (fnName === 'set' && owner) {
        return typeof key == 'string' && !!value ? this.set(owner, key, value) : typeof key === 'object' ? this.set(owner, key) : false;
      } else if (fnName === 'get' && owner) {
        return typeof key == 'string' ? this.get(owner, key) : this.get(owner);
      } else {
        return false;
      }
    },
    remove: function (owner, key) {
      var account = owner.valueOf(Cache);
      if (!account) {
        return false;
      }
      if (typeof key === 'string') {
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
      return cache_global.access('set', owner, key, value);
    },
    getCache: function (owner, key) {
      return cache_global.access('get', owner, key);
    },
    removeCache: function (owner, key) {
      return cache_global.remove(owner, key);
    },
    cache: function () {
      return cache_global.cache;
    },
    hasData: function (owner) {
      return cache_global.hasData(owner);
    }
  });
  return Cache;
}(core);
dom_velement = function (Ti) {
  var VElement = function (tagName, props, children, textContent) {
    this.tagName = tagName;
    this.props = typeof props == 'object' && !Ti.isArray(props) ? props : {};
    this.children = children && Ti.isArray(children) ? children : [];
    //this.scope = scope;
    if (textContent) {
      this.textContent = Ti.trim(textContent);
    }
  };
  VElement.prototype = {
    getAttr: function (name) {
      return this.props[name] || undefined;
    },
    setAttr: function (name, value) {
      try {
        this.props[name] = value;
      } catch (e) {
        console.log(e);
      }
    },
    delAttr: function (name) {
      try {
        if (this.props[name]) {
          var prop = this.props[name];
          delete this.props[name];
          return prop;
        } else {
          return '';
        }
      } catch (e) {
        console.log(e);
      }
    },
    hasAttr: function (name) {
      return name in this.props;
    }
  };
  return VElement;
}(core);
dom_directive = function (Ti, VElement) {
  var drtUtils = {
    _data: {},
    _scope: {},
    prefix: 't',
    readData: function (data, path) {
      if (typeof path !== 'string') {
        return console.error('props must be string');
      }
      var arr = path.split('.');
      var result;
      if (arr.length > 1) {
        result = data;
        for (var i = 0; i < arr.length; i++) {
          result = result[arr[i]];
        }
      } else {
        if (/\[\d+\]/.test(path)) {
          //如果path代表一个数组
          var index = parseInt(path.match(/\d+/)[0]);
          var name = path.match(/\w+/)[0].toString();
          result = data[name][index];
        } else {
          result = data[path];
        }
      }
      return result;
    },
    directives: {
      text: function (children, prop) {
        var text = drtUtils.readData(drtUtils._data, prop);
        var vEl = new VElement('#text', [], {}, text);
        return [vEl];
      },
      for: function (children, prop) {
        var _arr_prop = prop.split('in');
        var itemName = Ti.trim(_arr_prop[0]);
        var scopeName = Ti.trim(_arr_prop[1]);
        return children;
      }
    },
    hocks: {},
    extend: function () {
    }
  };
  return drtUtils;
}(core, dom_velement);
dom_vdom = function (Ti, Cache, VElement, drtUtils) {
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
      var cacheKey = '';
      if (this.el[0] === '#') {
        cacheKey = 'id_' + this.el.split('#')[1];
      } else if (this.el[0] === '.') {
        cacheKey = 'className_' + this.el.split('.')[1];
      } else {
        cacheKey = this.el;
      }
      //将虚拟DOM树存入缓存
      Ti.setCache(Ti.vDom, cacheKey, vDomTree);
      console.log(this._render(vDomTree));  // vDomTree = null;
    },
    _addWatcher: function () {
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
          var attr_name = attrs[j].nodeName;
          var attr_value = attrs[j].nodeValue;
          props[attr_name] = attr_value;
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
        return new VElement('#text', {}, [], $el.textContent);
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
      var textContent = vDomTree.textContent || '';
      // 将$data值传给drtUtils;
      drtUtils._data = this.$data;
      if (vDomTree.tagName !== '#text') {
        _node = document.createElement(tagName);
        Ti.each(props, function (name, prop) {
          var arr = name.split('-');
          /* if (arr && arr[0] == drtUtils.prefix) {
              var drt = arr[1];
              /!* 将$data传给directive的具体方法
              * 合理性改进，此处调用方式有待商榷
              * 指令系统，实际上是在介入对当前VElement对象的children
              * 修改未来渲染的children，实现绑定
              * *!/
              children = drtUtils.directives[drt](children,prop);
          }else{
              _node.setAttribute(name, prop);
          }*/
          _node.setAttribute(name, prop);
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
      document.querySelector('#clone').appendChild(this._createNode(vDomTree));
    }
  };
  Ti.render = function (options) {
    return new VDom(options);
  };
  return VDom;
}(core, core_cache, dom_velement, dom_directive);
core_promise = function (Ti) {
  var PENDING = 0;
  // 进行中
  var FULFILLED = 1;
  // 成功
  var REJECTED = 2;
  // 失败
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
      // 保证异步
      setTimeout(function () {
        if (_this.state === PENDING) {
          _this.state = FULFILLED;
          _this.value = result;
          for (var i = 0; i < _this.handlers.length; i++) {
            _this.handlers[i](result);  // 异步等待结束后，调用then里定义好的resolve函数
          }
        }
      }, 0);
    }
    // 异步任务失败后的处理
    function reject(err) {
      setTimeout(function () {
        if (_this.state === PENDING) {
          _this.state = REJECTED;
          _this.value = err;
          for (var i = 0; i < _this.rejectHandelers.length; i++) {
            _this.rejectHandelers[i](err);  // 异步等待结束后，调用then里定义好的reject函数
          }
        }
      }, 0);
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
          /*result.then(function (val) {
           resolve(val);
           });*/
          resolve(result.value);
        } else {
          resolve(result);  //改变状态，修改this.value
        }
      };
      var onRejectedFade = function (val) {
        var result = onRejected ? onRejected(val) : val;
        reject(result);  //改变状态
      };
      // 将回调方法分别添加到数组中
      _this.handlers.push(onResolvedFade);
      _this.rejectHandelers.push(onRejectedFade);  /*if(this.state==PENDING){
                                                   onRejectedFade(_this.value);
                                                   }*/
    });
  };
  // catch 实际上就是对then的部分二次封装，处理reject状态下的回调。
  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };
  Promise.all = function (arr) {
    if (!Array.isArray(arr) || !(arr instanceof Array)) {
      return new TypeError('the argument of Promise.all must be Array');
    }
    return new Promise(function (resolve, reject) {
      var values = [];
      var valIndex = [];
      function doPromise(index) {
        var canWeDo = true;
        if (Promise.isPromise(item)) {
          item.then(function (val) {
            // Promise执行结束后,且成功，状态变为resolved后，进入这里
            values[index] = val;
            //保证返回值的顺序与arr的顺序一致
            valIndex.push(index);
            //如果不是所有的项目都返回成功状态，则不准resolve
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
          // 若非Promise对象，则先封装成Promise对象
          item = Promise.resolve(item);
          doPromise(item);
        }
      }
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        doPromise(i, item);
      }
    });
  };
  Promise.race = function (arr) {
    if (!Array.isArray(arr) || !(arr instanceof Array)) {
      return new TypeError('the argument of Promise.race must be Array');
    }
  };
  Promise.resolve = function (value) {
    if (Promise.isPromise(value)) {
      return value;
    } else if (!!value.then && typeof value.then == 'function') {
      /* 但如果这个值是个thenable（即带有then方法），返回的promise会“跟随”这个thenable的对象，
       * 即用该值的then方法，替换Promise对象原有的then方法
       * mdn:https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
       */
      var promise = new Promise(function (resolve, reject) {
        resolve(value);
      });
      promise.then = value.then;
      return promise;
    } else {
      return new Promise(function (resolve, reject) {
        resolve(value);
      });
    }
  };
  // Promise.reject(reason)方法返回一个用reason拒绝的Promise。
  Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
      reject(reason);
    });
  };
  Ti.extend({ Promise: Promise });
  return Promise;
}(core);
Ti = function (Ti) {
  return Ti;
}(core);
}());