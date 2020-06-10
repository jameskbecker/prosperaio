console.log('HELLOLHELEOEOE');
window.console.debug = () => {
    return null;
};
const addContentWindowProxy = iframe => {
    const contentWindowProxy = {
        get(target, key) {
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
        const proxy = new Proxy(window, contentWindowProxy);
        Object.defineProperty(iframe, 'contentWindow', {
            get() {
                return proxy;
            },
            set(newValue) {
                return newValue;
            },
            enumerable: true,
            configurable: false
        });
    }
};
const handleIframeCreation = (target, thisArg, args) => {
    const iframe = target.apply(thisArg, args);
    const _iframe = iframe;
    const _srcdoc = _iframe.srcdoc;
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
const addIframeCreationSniffer = () => {
    const createElement = {
        get(target, key) {
            return Reflect.get(target, key);
        },
        apply: function (target, thisArg, args) {
            const isIframe = args && args.length && `${args[0]}`.toLowerCase() === 'iframe';
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
    const parseInput = arg => {
        const [mime, codecStr] = arg.trim().split(';');
        let codecs = [];
        if (codecStr && codecStr.includes('codecs="')) {
            codecs = codecStr
                .trim()
                .replace(`codecs="`, '')
                .replace(`"`, '')
                .trim()
                .split(',')
                .filter(x => !!x)
                .map(x => x.trim());
        }
        return {
            mime,
            codecStr,
            codecs
        };
    };
    const canPlayType = {
        get(target, key) {
            return Reflect.get(target, key);
        },
        apply: function (target, ctx, args) {
            if (!args || !args.length) {
                return target.apply(ctx, args);
            }
            const { mime, codecs } = parseInput(args[0]);
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
    get: () => ['en-US', 'en']
});
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.__proto__.query = parameters => parameters.name === 'notifications' ?
    Promise.resolve({
        state: Notification.permission
    })
    :
        originalQuery(parameters);
const oldCall = Function.prototype.call;
function call() {
    return oldCall.apply(this, arguments);
}
Function.prototype.call = call;
const nativeToStringFunctionString = Error.toString().replace(/Error/g, 'toString');
const oldToString = Function.prototype.toString;
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
    const makeFnsNative = (fns = []) => {
        const oldCall = Function.prototype.call;
        function call() {
            return oldCall.apply(this, arguments);
        }
        Function.prototype.call = call;
        const nativeToStringFunctionString = Error.toString().replace(/Error/g, 'toString');
        const oldToString = Function.prototype.toString;
        function functionToString() {
            for (const fn of fns) {
                if (this === fn.ref) {
                    return `function ${fn.name}() { [native code] }`;
                }
            }
            if (this === functionToString) {
                return nativeToStringFunctionString;
            }
            return oldCall.call(oldToString, this);
        }
        Function.prototype.toString = functionToString;
    };
    const mockedFns = [];
    const fakeData = {
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
            namedItem: instanceName => {
                const fn = function (name) {
                    if (!arguments.length) {
                        throw new TypeError(`Failed to execute 'namedItem' on '${instanceName}': 1 argument required, but only 0 present.`);
                    }
                    return this[name] || null;
                };
                mockedFns.push({
                    ref: fn,
                    name: 'namedItem'
                });
                return fn;
            },
            item: instanceName => {
                const fn = function (index) {
                    if (!arguments.length) {
                        throw new TypeError(`Failed to execute 'namedItem' on '${instanceName}': 1 argument required, but only 0 present.`);
                    }
                    return this[index] || null;
                };
                mockedFns.push({
                    ref: fn,
                    name: 'item'
                });
                return fn;
            },
            refresh: instanceName => {
                const fn = function () {
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
    const getSubset = (keys, obj) => keys.reduce((a, c) => (Object.assign(Object.assign({}, a), { [c]: obj[c] })), {});
    function generateMimeTypeArray() {
        const arr = fakeData.mimeTypes
            .map(obj => getSubset(['type', 'suffixes', 'description'], obj))
            .map(obj => Object.setPrototypeOf(obj, MimeType.prototype));
        arr.forEach(obj => {
            arr[obj.type] = obj;
        });
        arr.namedItem = fakeData.fns.namedItem('MimeTypeArray');
        arr.item = fakeData.fns.item('MimeTypeArray');
        return Object.setPrototypeOf(arr, MimeTypeArray.prototype);
    }
    const mimeTypeArray = generateMimeTypeArray();
    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => mimeTypeArray
    });
    function generatePluginArray() {
        const arr = fakeData.plugins
            .map(obj => getSubset(['name', 'filename', 'description'], obj))
            .map(obj => {
            const mimes = fakeData.mimeTypes.filter(m => m.__pluginName === obj.name);
            mimes.forEach((mime, index) => {
                navigator.mimeTypes[mime.type].enabledPlugin = obj;
                obj[mime.type] = navigator.mimeTypes[mime.type];
                obj[index] = navigator.mimeTypes[mime.type];
            });
            obj.length = mimes.length;
            return obj;
        })
            .map(obj => {
            obj.namedItem = fakeData.fns.namedItem('Plugin');
            obj.item = fakeData.fns.item('Plugin');
            return obj;
        })
            .map(obj => Object.setPrototypeOf(obj, Plugin.prototype));
        arr.forEach(obj => {
            arr[obj.name] = obj;
        });
        arr.namedItem = fakeData.fns.namedItem('PluginArray');
        arr.item = fakeData.fns.item('PluginArray');
        arr.refresh = fakeData.fns.refresh('PluginArray');
        return Object.setPrototypeOf(arr, PluginArray.prototype);
    }
    const pluginArray = generatePluginArray();
    Object.defineProperty(navigator, 'plugins', {
        get: () => pluginArray
    });
    makeFnsNative(mockedFns);
}
try {
    const isPluginArray = navigator.plugins instanceof PluginArray;
    const hasPlugins = isPluginArray && navigator.plugins.length > 0;
    mockPluginsAndMimeTypes();
}
catch (err) { }
const newProto = navigator.__proto__;
delete newProto.webdriver;
navigator.__proto__ = newProto;
try {
    var stripErrorStack = stack => stack
        .split('\n')
        .filter(line => !line.includes(`at Object.apply`))
        .filter(line => !line.includes(`at Object.get`))
        .join('\n');
    const getParameterProxyHandler = {
        get(target, key) {
            if (key === 'toString') {
                const dummyFn = function toString() {
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
            const param = (args || [])[0];
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
    const proxy = new Proxy(WebGLRenderingContext.prototype.getParameter, getParameterProxyHandler);
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
        const windowFrame = 85;
        window.outerWidth = window.innerWidth;
        window.outerHeight = window.innerHeight + windowFrame;
    }
}
catch (err) { }
//# sourceMappingURL=preload.js.map