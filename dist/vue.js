(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var id$1 = 0;
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id$1++;

      // 是一个渲染watcher
      this.renderWatcher = options;
      if (typeof exprOrFn === "string") {
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn;
      }
      this.getter = exprOrFn;

      // 实现计算属性与清理工作需要用
      this.deps = [];
      this.depsId = new Set();
      this.lazy = options.lazy;

      // 缓存值
      this.dirty = this.lazy;
      this.vm = vm;
      this.cb = cb;
      this.user = options.user;
      this.value = this.lazy ? undefined : this.get();
    }
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件，对应多个属性
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        // Dep.target = this
        pushTarget(this);
        var value = this.getter.call(vm);
        // Dep.target = null
        popTarget();
        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          // 让计算属性也收集渲染watcher
          this.deps[i].depend();
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.dirty) {
          // 如果是计算属性 依赖值变化了，就表示为脏
          this.dirty = true;
        }
        // 把当前watcher暂存起来
        queueWatcher(this);
        // this.get()
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(newValue, oldValue);
        }
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var has = {};
  // 防抖处理
  var pending = false;
  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = true;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }

  // 优雅降级，优先采用最快的执行方式
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observe$1 = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode("1");
    observe$1.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = "2";
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      // setTimeout(flushCallbacks, 0)
      timerFunc();
      waiting = true;
    }
  }

  var id = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id++;

      // 用于存放watcher
      this.subs = [];
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // this.subs.push(Dep.target) // 会重复watcher

        // 双向标记,dep与watcher多对多
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 所有dep增加属性
      this.dep = new Dep();
      Object.defineProperty(data, "__ob__", {
        value: this,
        // 不可枚举，循环的时候无法获取（解决死循环问题）
        enumerable: false
      });
      // data.__ob__ = this
      // Object.defineProperty只能劫持已经存在的属性
      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      }
      this.walk(data);
    }

    // 循环对象，对属性依次劫持
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }

      // 观测数组
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }(); // 深层次嵌套会递归，递归多了性能差，不存在的属性监控不到，存在的属性要重写方法  vue3->proxy解决这些问题
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    // 对所有对象进行属性劫持,childOb.dep用来进项依赖收集
    var childOb = observe(value);
    // 给每个属性增加一个dep
    var dep = new Dep();
    Object.defineProperty(target, key, {
      // 取值时，会执行get
      get: function get() {
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      // 修改的时候，会执行set
      set: function set(newValue) {
        if (newValue === value) return;
        // 设置值劫持
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 对对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }

    // 判断这个对象是否被监测过了
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      initComputed(vm);
    }
    if (opts.watch) {
      initWatch(vm);
    }
  }
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  function createWatcher(vm, key, handler) {
    if (typeof handler === "string") {
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    // 判断data是函数还是对象
    data = typeof data == 'function' ? data.call(vm) : data;
    vm._data = data;
    // 对数据进行劫持
    observe(data);

    // 将vm._data用vm来代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    // 将计算属性watcher保存到vm
    var watcher = vm._computedWatchers = {};
    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === "function" ? userDef : userDef.get;
      // 如果直接new watcher，会默认执行fn
      watcher[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === "function" ? userDef : userDef.get
    var setter = userDef.set || function () {};
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }
  function createComputedGetter(key) {
    // 需要检测是否需要执行getter
    return function () {
      var watcher = this._computedWatchers[key];
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        // 计算属性出栈后，还要渲染watcher，我们应该让计算属性watcher里面的属性 也去收集上一层watcher
        watcher.depend();
      }
      return watcher.value;
    };
  }
  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exprOrFn, cb) {
      // 值变化之后执行cb函数
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
  // 第一个分组就是属性的key value 就是 分组3/分组4/分组五
  var startTagClose = /^\s*(\/?)>/; // <div> <br/>

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    // 用于存放栈元素的
    var stack = [];
    // 指向栈中最后一个元素
    var currentParent;
    var root;

    // 用于转换成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    // 开始标签
    function start(tag, attrs) {
      // 创建ast节点
      var node = createASTElement(tag, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node;
    }

    // 文本
    function chars(text) {
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    // 结束标签
    function end(tag) {
      // 弹出最后一个元素
      stack.pop();
      currentParent = stack[stack.length - 1];
    }
    // 截取已经匹配完的字符串
    function advance(length) {
      html = html.substring(length);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false;
    }
    while (html) {
      // 判断是否是标签
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // 匹配开始标签
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        // 解析结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        // 解析文本
        var text = html.substring(0, textEnd);
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量\
  function gen(node) {
    if (node.type === 1) {
      return genCode(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          // 匹配的位置
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  function genCode(ast) {
    var children = genChildren(ast.children);
    return "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
  }
  function compileToFunction(template) {
    // 将template转化成ast语法树
    var ast = parseHTML(template);

    // 模版引擎实现原理：with + new Function

    // 生成render函数
    var code = genCode(ast);
    code = "with(this){return ".concat(code, "}");
    return new Function(code);
  }

  // h()  _c()
  function createElementVNode(vm, tag, data) {
    if (data == null) data = {};
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // 虚拟dom
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    // 挂载真实dom
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;
      // 将vnode转换成真实dom
      vm.$el = patch(el, vnode);
    };
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    // 渲染虚拟dom
    Vue.prototype._render = function () {
      // 当渲染时会去实例中取值，就可以将属性与视图绑定在一起
      return vm.$options.render.call(this);
    };
  }
  function mountComponent(vm, el) {
    // 这里的el 是通过querySelector处理过的
    vm.$el = el;

    // 1.调用render方法产生虚拟节点 虚拟DOM

    // 重写渲染
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true);

    // vm._update(vm._render()); // vm.$options.render() 虚拟节点

    // 2.根据虚拟DOM产生真实DOM

    // 3.插入到el元素中
  }
  // vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树
  // 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
  // render函数会去产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创造真实的DOM

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // $是vue专属的属性
      var vm = this;
      // 将用户的选项挂载到实例上
      vm.$options = options;

      // 初始化状态，初始化计算属性，watch
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        var template;
        if (!ops.template && el) {
          // 使用el
          template = el.outerHTML;
        } else {
          // 使用template
          if (el) template = ops.template;
        }
        if (template && el) {
          // 对模版进行编译
          ops.render = compileToFunction(template);
        }
      }
      // 组件的挂载
      mountComponent(vm, el);
    };
  }

  const strats = {};
  const LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
      //  {} {created:function(){}}   => {created:[fn]}
      // {created:[fn]}  {created:function(){}} => {created:[fn,fn]}
      if (c) {
        // 如果儿子有 父亲有   让父亲和儿子拼在一起
        if (p) {
          return p.concat(c);
        } else {
          return [c]; // 儿子有父亲没有 ，则将儿子包装成数组
        }
      } else {
        return p; // 如果儿子没有则用父亲即可
      }
    };
  });

  function mergeOptions(parent, child) {
    const options = {};
    for (let key in parent) {
      // 循环老的  {}
      mergeField(key);
    }
    for (let key in child) {
      // 循环老的   {a:1}
      if (!parent.hasOwnProperty(key)) {
        mergeField(key);
      }
    }
    function mergeField(key) {
      // 策略模式 用策略模式减少if /else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 如果不在策略中则以儿子为主
        options[key] = child[key] || parent[key]; // 优先采用儿子，在采用父亲
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    // 静态方法

    Vue.options = {};
    Vue.mixin = function (mixin) {
      // 我们期望将用户的选项和 全局的options进行合并 '
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  initLifeCycle(Vue);
  initGlobalAPI(Vue);
  initStateMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
