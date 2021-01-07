const { performance } = require('perf_hooks');
const nodeCrypto = require("crypto");
		
const window = {
    document: {},
    navigator: {},
    Uint8Array,
    Array,
    Object,
    setTimeout,
    setInterval,
    crypto: {
        getRandomValues(b) {
            nodeCrypto.randomFillSync(b);
        },
    }
};
global = window;
window.global = window;
global.window = window

var a = '';

window.__wasmExecute = function () {};

global.fs = {
    constants: {
        O_WRONLY: -1,
        O_RDWR: -1,
        O_CREAT: -1,
        O_TRUNC: -1,
        O_APPEND: -1,
        O_EXCL: -1,
    },
    writeSync: function (b, c) {
        a += decoder.decode(c);
        b = a.lastIndexOf('\n');
        -1 != b && (console.log(a.substr(0, b)), (a = a.substr(b + 1)));
        return c.length;
    },
    write: function (a, b, f, d, e, g) {
        if (0 !== f || d !== b.length || null !== e)
            throw Error('not implemented');
        a = this.writeSync(a, b);
        g(null, a);
    },
    open: function (a, b, f, d) {
        a = Error('not implemented');
        a.code = 'ENOSYS';
        d(a);
    },
    fsync: function (a, b) {
        b(null);
    },
};
const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');
let g = [];
class Go {
    constructor(cookieString) {
        this.cookieString = cookieString;
        this._callbackTimeouts = new Map();
        this._nextCallbackTimeoutID = 1;
        const getMemory = () => {
            return new DataView(this._inst.exports.memory.buffer);
        };
        const setInt64 = (addr, v) => {
            getMemory().setUint32(addr + 0, v, true);
            getMemory().setUint32(addr + 4, Math.floor(v / 4294967296), true);
        };
        const loadValue = (addr) => {
            var d = getMemory().getFloat64(addr, !0);

            if (0 !== d) {
                if (!isNaN(d)) return d;
                var id = getMemory().getUint32(addr, !0);
                return this._values[id];
            }
        };
        const storeValue = (addr, v) => {
            const nanHead = 0x7ff80000;

            if (typeof v === 'number' && v !== 0) {
                if (isNaN(v)) {
                    getMemory().setUint32(addr + 4, nanHead, true);
                    getMemory().setUint32(addr, 0, true);
                    return;
                }
                getMemory().setFloat64(addr, v, true);
                return;
            }

            if (v === undefined) {
                getMemory().setFloat64(addr, 0, true);
                return;
            }

            let id = this._refs.get(v);
            if (id === undefined) {
                id = this._values.length;
            }
            this._values[id] = v;
            this._refs.set(v, id);
            let typeFlag = 0;
            switch (typeof v) {
                case 'string':
                    typeFlag = 1;
                    break;
                case 'symbol':
                    typeFlag = 2;
                    break;
                case 'function':
                    typeFlag = 3;
                    break;
            }
            getMemory().setUint32(addr + 4, nanHead | typeFlag, true);
            getMemory().setUint32(addr, id, true);
        };
        const loadSliceOfValues = (a, b, c) => {
            c = Array(b);
            for (var d = 0; d < b; d++) c[d] = loadValue(a + 8 * d);
            return c;
        };
        const loadString = (b, c) => {
            return decoder.decode(
                new DataView(this._inst.exports.memory.buffer, b, c)
            );
        };
        const timeOrigin = Date.now() - performance.now();
        this.importObject = {
            wasi_unstable: {
                fd_write: function (a, b, d, f) {
                    if (1 == a)
                        for (a = 0; a < d; a++) {
                            var k = b + 8 * a,
                                q = getMemory().getUint32(k + 0, !0);
                            k = getMemory().getUint32(k + 4, !0);
                            for (var h = 0; h < k; h++) {
                                var p = getMemory().getUint8(q + h);
                                13 != p &&
                                    (10 == p
                                        ? ((p = decoder.decode(
                                              new Uint8Array(g)
                                          )),
                                          (g = []),
                                          console.log(p))
                                        : g.push(p));
                            }
                        }
                    else console.error('invalid file descriptor:', a);
                    getMemory().setUint32(f, 0, !0);
                    return 0;
                },
            },
            env: {
                'runtime.ticks': () => {
                    return timeOrigin + performance.now();
                },
                'runtime.sleepTicks': (ms) => {
                    this._resolveCallbackPromise();
                    setTimeout(this._inst.exports.go_scheduler, ms);
                },
                'syscall/js.stringVal': (a, b, c) => {
                    b = loadString(b, c);
                    //console.log('syscall/js.stringVal', b);
                    storeValue(a, b);
                },
                'syscall/js.valueGet': (a, b, c, e) => {
                    const value = loadString(c, e);
                    const target = loadValue(b);
                    //console.log( `[GET] memory[${a}] = ${target.toString()}["${value}"]`);
                    let result;

                    switch (value) {
                        case 'process':
                            result = undefined;
                            break;

                        case 'cookie':
                            result = this.cookieString;
                            break;

                        case 'fs':
                        default:
                            result = Reflect.get(target, value);
                    }

                    
                    //console.log(typeof result !== 'undefined' ? (typeof result == 'string' || typeof result == 'number') ? result : result.toString() : undefined);
                    storeValue(a, result);
                },
                'syscall/js.valueSet': (a, b, c, d) => {
                    const target = loadValue(a);
                    const propertyKey = loadString(b, c);
                    const value = loadValue(d);
                    //console.log(`${a}["${b}"]=${d}`);
                    if (propertyKey === 'cookie') {
                        this.cookieString += value;
                    }
                    else {
                        Reflect.set(target, propertyKey, value);
                    }
                    
                },
                'syscall/js.valueIndex': (a, b, c) => {
                    storeValue(a, Reflect.get(loadValue(b), c));
                },
                'syscall/js.valueSetIndex': (a, b, c) => {
                    Reflect.set(loadValue(a), b, loadValue(c));
                },
                'syscall/js.valueCall': (a, b, e, g, h, n, v) => {
                    b = loadValue(b);
                    e = loadString(e, g);
                    //console.log('[CALL]', `${b}["${e}"]`)
                    h = loadSliceOfValues(h, n, v);
                    try {
                        var k = Reflect.get(b, e);
                        storeValue(a, Reflect.apply(k, b, h));
                        getMemory().setUint8(a + 8, 1);
                    } catch (x) {
                        storeValue(a, x), getMemory().setUint8(a + 8, 0);
                    }
                },
                'syscall/js.valueInvoke': (a, b, e, g, h) => {
                    try {
                        var k = loadValue(b),
                            q = loadSliceOfValues(e, g, h);
                        storeValue(a, Reflect.apply(k, void 0, q));
                        getMemory().setUint8(a + 8, 1);
                    } catch (w) {
                        storeValue(a, w), getMemory().setUint8(a + 8, 0);
                    }
                },
                'syscall/js.valueNew': (a, b, e, g, h) => {
                    b = loadValue(b);
                    e = loadSliceOfValues(e, g, h);
                    try {
                        storeValue(a, Reflect.construct(b, e)),
                            getMemory().setUint8(a + 8, 1);
                    } catch (u) {
                        storeValue(a, u), getMemory().setUint8(a + 8, 0);
                    }
                },
                'syscall/js.valueLength': (addr) => {
                    return loadValue(addr).length;
                },
                'syscall/js.valuePrepareString': (saddr, vaddr) => {
                    const str = encoder.encode(String(loadValue(vaddr)));
                    storeValue(saddr, str);
                    setInt64(saddr + 8, str.length);
                },
                'syscall/js.valueLoadString': (addr, byteOffset, length) => {
                    const str = loadValue(addr);
                    new Uint8Array(
                        this._inst.exports.memory.buffer,
                        byteOffset,
                        length
                    ).set(str);
                },
            },
        };
    }

    async run(a) {
        this._inst = a;

        this._values = [
            NaN,
            0,
            null,
            !0,
            !1,
            global,
            this._inst.exports.memory,
            this,
        ];
        this._refs = new Map();
        this._callbackShutdown = false;
        this.exited = false;

        new DataView(this._inst.exports.memory.buffer);
        this._exitPromise = new Promise((resolve) => {
            this._resolveCallbackPromise = function () {
                if (this.exited)
                    throw Error('bad callback: Go program has already exited');
                setTimeout(resolve, 0);
            };
        });
        this._inst.exports._start();
        if (this.exited) {
            this._resolveCallbackPromise();
        }
        await this._exitPromise;
        return;
        
    }

    _resume() {
        if (this.exited) {
            throw Error('Go program has already exited');
        }
        this._inst.exports.resume();
        if (this.exited) {
            this._resolveExitPromise();
        }
    }

    _makeFuncWrapper(id) {
        var go = this;
        return function () {
            const event = { id, this: this, args: arguments };
            go._pendingEvent = event;
            go._resume();
            return event.result;
        };
    }
}

module.exports = Go;