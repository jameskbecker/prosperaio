"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var isMac = process.platform === 'darwin';
exports.default = __spreadArrays((isMac ? [{
        label: 'ProsperAIO',
        submenu: [
            { role: 'about'
            },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []), [
    {
        label: 'File',
        submenu: [
            {
                role: isMac ? 'close' : 'quit'
            },
            { type: 'separator' },
            {
                label: 'Run All Tasks',
                accelerator: 'CommandOrControl+Shift+R',
                click: function () {
                    if (workerWindow) {
                        workerWindow.webContents.send('run all tasks');
                    }
                }
            },
            {
                label: 'Stop All Tasks',
                accelerator: 'CommandOrControl+Shift+S',
                click: function () {
                    if (workerWindow) {
                        workerWindow.webContents.send('stop all tasks');
                    }
                }
            },
            {
                label: 'Delete All Tasks',
                accelerator: 'CommandOrControl+Shift+D',
                click: function () {
                    if (workerWindow) {
                        workerWindow.webContents.send('delete all tasks');
                    }
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: __spreadArrays([
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
        ], (isMac ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
        ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
        ]))
    },
    {
        label: 'Window',
        submenu: [
            {
                label: 'Reload Data',
                click: function () {
                    if (workerWindow) {
                        global['HARVESTERS'] = {
                            'supreme': [],
                            'kickz': [],
                            'kickzpremium': [],
                        };
                        global['HARVESTER_QUEUES'] = {
                            'supreme': [],
                            'kickz': [],
                            'kickzpremium': [],
                        };
                        workerWindow.webContents.reload();
                        mainWindow.webContents.reload();
                    }
                },
                accelerator: 'CommandOrControl+R'
            },
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    }
]);
//# sourceMappingURL=menu-template.js.map