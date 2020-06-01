"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captcha = exports.def = void 0;
var def = {
    'kickz': {
        enabled: false,
        type: 'kickz',
        label: 'Kickz',
        baseUrl: 'https://www.kickz.com'
    },
    'kickz-premium': {
        enabled: false,
        type: 'kickz',
        label: 'Kickz Premium',
        baseUrl: 'https://www.kickzpremium.com'
    },
    'kith': {
        enabled: false,
        type: 'shopify',
        label: 'Kith',
        baseUrl: 'https://www.kith.com'
    },
    'supreme-local': {
        enabled: false,
        type: 'supreme',
        label: 'Supreme Local',
        baseUrl: 'http://127.0.0.1:8000',
    },
    'supreme-eu': {
        enabled: true,
        type: 'supreme',
        label: 'Supreme EU',
        baseUrl: 'https://www.supremenewyork.com',
    },
    'supreme-jp': {
        enabled: true,
        type: 'supreme',
        label: 'Supreme JP',
        baseUrl: 'https://www.supremenewyork.com',
    },
    'supreme-us': {
        enabled: true,
        type: 'supreme',
        label: 'Supreme US',
        baseUrl: 'https://www.supremenewyork.com',
    },
    'off-white': {
        enabled: false,
        type: 'offwhite',
        label: 'Off-White',
        baseUrl: 'https://www.off---white.com/'
    }
};
exports.def = def;
var captcha = [
    {
        label: 'Supreme',
        value: 'supreme'
    }
];
exports.captcha = captcha;
//# sourceMappingURL=sites.js.map