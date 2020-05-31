var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
console.log('HELLOLHELEOEOE');
window.console.debug = function () {
    return null;
};
var addContentWindowProxy = function (iframe) {
    var contentWindowProxy = {
        get: function (target, key) {
            if (key === 'self') {
                return this;
            }
            if (key === 'frameElement') {
                return iframe;
            }
            return Reflect.get(target, key);
        }
    };
    if (!iframe.contentWindow) {
        var proxy_1 = new Proxy(window, contentWindowProxy);
        Object.defineProperty(iframe, 'contentWindow', {
            get: function () {
                return proxy_1;
            },
            set: function (newValue) {
                return newValue;
            },
            enumerable: true,
            configurable: false
        });
    }
};
var handleIframeCreation = function (target, thisArg, args) {
    var iframe = target.apply(thisArg, args);
    var _iframe = iframe;
    var _srcdoc = _iframe.srcdoc;
    Object.defineProperty(iframe, 'srcdoc', {
        configurable: true,
        get: function () {
            return _iframe.srcdoc;
        },
        set: function (newValue) {
            addContentWindowProxy(this);
            Object.defineProperty(iframe, 'srcdoc', {
                configurable: false,
                writable: false,
                value: _srcdoc
            });
            _iframe.srcdoc = newValue;
        }
    });
    return iframe;
};
var addIframeCreationSniffer = function () {
    var createElement = {
        get: function (target, key) {
            return Reflect.get(target, key);
        },
        apply: function (target, thisArg, args) {
            var isIframe = args && args.length && ("" + args[0]).toLowerCase() === 'iframe';
            if (!isIframe) {
                return target.apply(thisArg, args);
            }
            else {
                return handleIframeCreation(target, thisArg, args);
            }
        }
    };
    document.createElement = new Proxy(document.createElement, createElement);
};
addIframeCreationSniffer();
try {
    var parseInput_1 = function (arg) {
        var _a = arg.trim().split(';'), mime = _a[0], codecStr = _a[1];
        var codecs = [];
        if (codecStr && codecStr.includes('codecs="')) {
            codecs = codecStr
                .trim()
                .replace("codecs=\"", '')
                .replace("\"", '')
                .trim()
                .split(',')
                .filter(function (x) { return !!x; })
                .map(function (x) { return x.trim(); });
        }
        return {
            mime: mime,
            codecStr: codecStr,
            codecs: codecs
        };
    };
    var canPlayType = {
        get: function (target, key) {
            return Reflect.get(target, key);
        },
        apply: function (target, ctx, args) {
            if (!args || !args.length) {
                return target.apply(ctx, args);
            }
            var _a = parseInput_1(args[0]), mime = _a.mime, codecs = _a.codecs;
            if (mime === 'video/mp4') {
                if (codecs.includes('avc1.42E01E')) {
                    return 'probably';
                }
            }
            if (mime === 'audio/x-m4a' && !codecs.length) {
                return 'maybe';
            }
            if (mime === 'audio/aac' && !codecs.length) {
                return 'probably';
            }
            return target.apply(ctx, args);
        }
    };
    HTMLMediaElement.prototype.canPlayType = new Proxy(HTMLMediaElement.prototype.canPlayType, canPlayType);
}
catch (err) { }
Object.defineProperty(navigator, 'languages', {
    get: function () { return ['en-US', 'en']; }
});
var originalQuery = window.navigator.permissions.query;
window.navigator.permissions.__proto__.query = function (parameters) {
    return parameters.name === 'notifications' ?
        Promise.resolve({
            state: Notification.permission
        })
        :
            originalQuery(parameters);
};
var oldCall = Function.prototype.call;
function call() {
    return oldCall.apply(this, arguments);
}
Function.prototype.call = call;
var nativeToStringFunctionString = Error.toString().replace(/Error/g, 'toString');
var oldToString = Function.prototype.toString;
function functionToString() {
    if (this === window.navigator.permissions.query) {
        return 'function query() { [native code] }';
    }
    if (this === functionToString) {
        return nativeToStringFunctionString;
    }
    return oldCall.call(oldToString, this);
}
Function.prototype.toString = functionToString;
function mockPluginsAndMimeTypes() {
    var makeFnsNative = function (fns) {
        if (fns === void 0) { fns = []; }
        var oldCall = Function.prototype.call;
        function call() {
            return oldCall.apply(this, arguments);
        }
        Function.prototype.call = call;
        var nativeToStringFunctionString = Error.toString().replace(/Error/g, 'toString');
        var oldToString = Function.prototype.toString;
        function functionToString() {
            for (var _i = 0, fns_1 = fns; _i < fns_1.length; _i++) {
                var fn = fns_1[_i];
                if (this === fn.ref) {
                    return "function " + fn.name + "() { [native code] }";
                }
            }
            if (this === functionToString) {
                return nativeToStringFunctionString;
            }
            return oldCall.call(oldToString, this);
        }
        Function.prototype.toString = functionToString;
    };
    var mockedFns = [];
    var fakeData = {
        mimeTypes: [{
                type: 'application/pdf',
                suffixes: 'pdf',
                description: '',
                __pluginName: 'Chrome PDF Viewer'
            },
            {
                type: 'application/x-google-chrome-pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                __pluginName: 'Chrome PDF Plugin'
            },
            {
                type: 'application/x-nacl',
                suffixes: '',
                description: 'Native Client Executable',
                enabledPlugin: Plugin,
                __pluginName: 'Native Client'
            },
            {
                type: 'application/x-pnacl',
                suffixes: '',
                description: 'Portable Native Client Executable',
                __pluginName: 'Native Client'
            }
        ],
        plugins: [{
                name: 'Chrome PDF Plugin',
                filename: 'internal-pdf-viewer',
                description: 'Portable Document Format'
            },
            {
                name: 'Chrome PDF Viewer',
                filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                description: ''
            },
            {
                name: 'Native Client',
                filename: 'internal-nacl-plugin',
                description: ''
            }
        ],
        fns: {
            namedItem: function (instanceName) {
                var fn = function (name) {
                    if (!arguments.length) {
                        throw new TypeError("Failed to execute 'namedItem' on '" + instanceName + "': 1 argument required, but only 0 present.");
                    }
                    return this[name] || null;
                };
                mockedFns.push({
                    ref: fn,
                    name: 'namedItem'
                });
                return fn;
            },
            item: function (instanceName) {
                var fn = function (index) {
                    if (!arguments.length) {
                        throw new TypeError("Failed to execute 'namedItem' on '" + instanceName + "': 1 argument required, but only 0 present.");
                    }
                    return this[index] || null;
                };
                mockedFns.push({
                    ref: fn,
                    name: 'item'
                });
                return fn;
            },
            refresh: function (instanceName) {
                var fn = function () {
                    return undefined;
                };
                mockedFns.push({
                    ref: fn,
                    name: 'refresh'
                });
                return fn;
            }
        }
    };
    var getSubset = function (keys, obj) {
        return keys.reduce(function (a, c) {
            var _a;
            return (__assign(__assign({}, a), (_a = {}, _a[c] = obj[c], _a)));
        }, {});
    };
    function generateMimeTypeArray() {
        var arr = fakeData.mimeTypes
            .map(function (obj) { return getSubset(['type', 'suffixes', 'description'], obj); })
            .map(function (obj) { return Object.setPrototypeOf(obj, MimeType.prototype); });
        arr.forEach(function (obj) {
            arr[obj.type] = obj;
        });
        arr.namedItem = fakeData.fns.namedItem('MimeTypeArray');
        arr.item = fakeData.fns.item('MimeTypeArray');
        return Object.setPrototypeOf(arr, MimeTypeArray.prototype);
    }
    var mimeTypeArray = generateMimeTypeArray();
    Object.defineProperty(navigator, 'mimeTypes', {
        get: function () { return mimeTypeArray; }
    });
    function generatePluginArray() {
        var arr = fakeData.plugins
            .map(function (obj) { return getSubset(['name', 'filename', 'description'], obj); })
            .map(function (obj) {
            var mimes = fakeData.mimeTypes.filter(function (m) { return m.__pluginName === obj.name; });
            mimes.forEach(function (mime, index) {
                navigator.mimeTypes[mime.type].enabledPlugin = obj;
                obj[mime.type] = navigator.mimeTypes[mime.type];
                obj[index] = navigator.mimeTypes[mime.type];
            });
            obj.length = mimes.length;
            return obj;
        })
            .map(function (obj) {
            obj.namedItem = fakeData.fns.namedItem('Plugin');
            obj.item = fakeData.fns.item('Plugin');
            return obj;
        })
            .map(function (obj) { return Object.setPrototypeOf(obj, Plugin.prototype); });
        arr.forEach(function (obj) {
            arr[obj.name] = obj;
        });
        arr.namedItem = fakeData.fns.namedItem('PluginArray');
        arr.item = fakeData.fns.item('PluginArray');
        arr.refresh = fakeData.fns.refresh('PluginArray');
        return Object.setPrototypeOf(arr, PluginArray.prototype);
    }
    var pluginArray = generatePluginArray();
    Object.defineProperty(navigator, 'plugins', {
        get: function () { return pluginArray; }
    });
    makeFnsNative(mockedFns);
}
try {
    var isPluginArray = navigator.plugins instanceof PluginArray;
    var hasPlugins = isPluginArray && navigator.plugins.length > 0;
    mockPluginsAndMimeTypes();
}
catch (err) { }
var newProto = navigator.__proto__;
delete newProto.webdriver;
navigator.__proto__ = newProto;
try {
    var stripErrorStack = function (stack) {
        return stack
            .split('\n')
            .filter(function (line) { return !line.includes("at Object.apply"); })
            .filter(function (line) { return !line.includes("at Object.get"); })
            .join('\n');
    };
    var getParameterProxyHandler = {
        get: function (target, key) {
            if (key === 'toString') {
                var dummyFn = function toString() {
                    return target.toString();
                }.bind(Function.prototype.toString);
                return dummyFn;
            }
            try {
                return Reflect.get(target, key);
            }
            catch (err) {
                err.stack = stripErrorStack(err.stack);
                throw err;
            }
        },
        apply: function (target, thisArg, args) {
            var param = (args || [])[0];
            if (param === 37445) {
                return 'Intel Inc.';
            }
            if (param === 37446) {
                return 'Intel Iris OpenGL Engine';
            }
            try {
                return Reflect.apply(target, thisArg, args);
            }
            catch (err) {
                err.stack = stripErrorStack(err.stack);
                throw err;
            }
        }
    };
    var proxy = new Proxy(WebGLRenderingContext.prototype.getParameter, getParameterProxyHandler);
    Object.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: proxy
    });
}
catch (err) {
    console.warn(err);
}
try {
    if (window.outerWidth && window.outerHeight) { }
    else {
        var windowFrame = 85;
        window.outerWidth = window.innerWidth;
        window.outerHeight = window.innerHeight + windowFrame;
    }
}
catch (err) { }
//# sourceMappingURL=preload.js.map