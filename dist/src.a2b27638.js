// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/react-dom/dom.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAttributes = setAttributes;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function setAttributes(dom, key, value) {
  //替换className为class
  if (key === "className") {
    key = "class";
  } //key为onXXXX的为事件


  if (/on\w+/.test(key)) {
    key = key.toLowerCase(); //onClick => onclick

    dom[key] = value || "";
  } else if (key === "style") {
    //更新style
    if (!value || typeof value === "string") {
      dom.style.cssText = value || "";
    } else if (value && _typeof(value) === "object") {
      for (var _name in value) {
        dom.style[_name] = typeof value[_name] === "number" ? value[_name] + "px" : value[_name];
      }
    }
  } else {
    //普通属性,可以直接更新 
    if (key in dom) {
      dom[key] = value;
    }

    if (value) {
      dom.setAttribute(key, value); //real dom api
    } else {
      dom.removeAttribute(name);
    }
  }
}
},{}],"src/react-dom/render.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderComponent = renderComponent;
exports.render = render;

var _component = _interopRequireDefault(require("../react/component"));

var _dom = require("./dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//虚拟DOM => 实际DOM
//{return:HTMLDom}
function _render(vNode) {
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    vNode = "";
  } //tag为字符串则此虚拟DOM为原生HTML组件


  if (typeof vNode === "string" || typeof vNode === "number") {
    var textNode = document.createTextNode(vNode);
    return textNode;
  } //component.base保存的是组件的dom对象
  //tag为函数则此虚拟DOM为自造组件


  if (typeof vNode.tag === "function") {
    var component = createComponent(vNode.tag, vNode.attrs);
    setComponentProps(component, vNode.attrs);
    return component.base;
  }

  var dom = document.createElement(vNode.tag); //对于原生组件直接用setAttributes把所有属性全部设置好
  //若虚拟DOM有attrs则将每个attrs属性都绑到实际DOM上

  if (vNode.attrs) {
    Object.keys(vNode.attrs).forEach(function (key) {
      (0, _dom.setAttributes)(dom, key, vNode.attrs[key]);
    });
  } //每个自定义组件最外层为<div></div>所以可以进行递归渲染
  //递归渲染子节点


  vNode.children.forEach(function (child) {
    return render(child, dom);
  });
  return dom;
} //返回类组件或函数型组件扩展为类组件的实例
//{return:React.Component}


function createComponent(component, props) {
  var instance; //若为类组件则可以直接返回实例,且有render方法

  if (component.prototype && component.prototype.render) {
    instance = new component(props);
  } else {
    //函数组件则扩展定义为类组件
    //增加render方法
    instance = new _component.default(props);
    instance.constructor = component;

    instance.render = function () {
      //this -> instance
      //返回vNode(tag,attr,children)
      return this.constructor(props);
    };
  } //返回instance(base,render方法,props属性)


  console.log(instance);
  return instance;
} //更新props
//实现componentWillMount和componentWillReceiveProps方法


function setComponentProps(component, props) {
  //生成实际DOM前触发componentWilMount方法
  if (!component.base) {
    if (component.componentWillMount) {
      component.componentWillMount();
    }
  } else if (component.componentWillReceiveProps) {
    component.componentWillReceiveProps(props);
  }

  component.props = props;
  renderComponent(component);
} //用于渲染组件,输入为类组件
//component.base保存的是实际DOM，
//反过来base._component保存的是dom对象所对应的instance实例，为了把他们关联起来
//可实现componentWillUpdate,componentDidUpdate,componentDidMount


function renderComponent(component) {
  var base;
  var render = component.render(); //返回instance,虚拟DOM
  //有实际DOM时才可出发componentWillUpdate

  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

  base = _render(render); //用虚拟dom生成实际DOM
  //更新实际DOM之后触发componentDidXXXX事件

  if (component.base) {
    if (component.componentDidUpdate) {
      component.componentDidUpdate();
    }
  } else if (component.componentDidMount) {
    component.componentDidMount();
  }

  if (component.base && component.base.parentNode) {
    //将component.base替换成base
    //更新此节点为重新渲染后的节点base,并重新绑定
    component.base.parentNode.replaceChild(base, component.base);
  }

  component.base = base;
  base._component = component;
}

function unmountComponent(component) {
  if (component.componentWillUnmount) {
    component.componentWillUnmount();
  }

  removeNode(component.base);
} //将_render函数后返回的实际DOM再绑到container DOM下面
//并返回实际DOM container节点


function render(vNode, container) {
  //mount rendered dom to container
  return container.appendChild(_render(vNode));
}
},{"../react/component":"src/react/component.js","./dom":"src/react-dom/dom.js"}],"src/react/component.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _render = require("../react-dom/render");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//React.Component
var Component =
/*#__PURE__*/
function () {
  function Component() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Component);

    this.state = {};
    this.props = props;
  }

  _createClass(Component, [{
    key: "setState",
    value: function setState(stateChange) {
      //将stateChange的属性全部拷贝到this.state上面
      Object.assign(this.state, stateChange);
      (0, _render.renderComponent)(this);
    }
  }]);

  return Component;
}();

var _default = Component;
exports.default = _default;
},{"../react-dom/render":"src/react-dom/render.js"}],"src/react/createElement.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

//创造虚拟DOM的函数
//tags: h1,div...
//attrs:DOM的attributes,为object
//剩下的参数为子DOM
function createElement(tag, attrs) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    tag: tag,
    attrs: attrs,
    children: children
  };
}

var _default = createElement;
exports.default = _default;
},{}],"src/react/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _component = _interopRequireDefault(require("./component"));

var _createElement = _interopRequireDefault(require("./createElement"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  Component: _component.default,
  createElement: _createElement.default
};
exports.default = _default;
},{"./component":"src/react/component.js","./createElement":"src/react/createElement.js"}],"src/react-dom/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _render = require("./render");

var _default = {
  render: _render.render
};
exports.default = _default;
},{"./render":"src/react-dom/render.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

var _react = _interopRequireDefault(require("./react"));

var _reactDom = _interopRequireDefault(require("./react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// const Welcome = (props) => {
//     return <h1>Hello,{props.name}</h1>;
// }
// function App() {
//     return (
//         <div>
//             <Welcome name="Sara" />
//             <Welcome name="Cahal" />
//             <Welcome name="Edite" />
//         </div>
//     );
// }
// ReactDOM.render(
//     <App />,
//     document.getElementById( 'root' )
// );
var Counter =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Counter, _React$Component);

  function Counter(props) {
    var _this;

    _classCallCheck(this, Counter);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Counter).call(this, props));
    _this.state = {
      num: 0
    };
    return _this;
  }

  _createClass(Counter, [{
    key: "componentWillUpdate",
    value: function componentWillUpdate() {
      console.log('update');
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      console.log('mount');
    }
  }, {
    key: "onClick",
    value: function onClick() {
      console.log(this.state);
      this.setState({
        num: this.state.num + 1
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return _react.default.createElement("div", {
        onClick: function onClick() {
          return _this2.onClick();
        }
      }, _react.default.createElement("h1", null, "number: ", this.state.num), _react.default.createElement("button", null, "add"));
    }
  }]);

  return Counter;
}(_react.default.Component);

_reactDom.default.render(_react.default.createElement(Counter, null), document.getElementById('root'));
},{"./react":"src/react/index.js","./react-dom":"src/react-dom/index.js"}],"C:/Users/晓旭/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "7259" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/晓旭/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map