const isMac = process.platform === 'darwin'
export default [
	// { role: 'appMenu' }
	...(isMac ? [{
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
	}] : []),
	// { role: 'fileMenu' }
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
				click: function() {
					if (workerWindow) {
						workerWindow.webContents.send('run all tasks');
					}
				}
			},
			{
				label: 'Stop All Tasks',
				accelerator: 'CommandOrControl+Shift+S',
				click: function() {
					if (workerWindow) {
						workerWindow.webContents.send('stop all tasks');
					}
				}
			},
			{
				label: 'Delete All Tasks',
				accelerator: 'CommandOrControl+Shift+D',
				click: function() {
					if (workerWindow) {
						workerWindow.webContents.send('delete all tasks');
					}
				}
			}//,
			// { type: 'separator' },
			// {
			// 	label: 'New Profile',
			// 	accelerator: 'CommandOrControl+P'
			// },
		]
	},
	// { role: 'editMenu' }
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac ? [
				{ role: 'pasteAndMatchStyle' },
				{ role: 'delete' },
				{ role: 'selectAll' },
				{ type: 'separator' },
			] : [
					{ role: 'delete' },
					{ type: 'separator' },
					{ role: 'selectAll' }
				])
		]
	},
	// { role: 'windowMenu' }
	{
		label: 'Window',
		submenu: [
			{ 
				label: 'Reload Data',
				click: function() {
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
						}
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
]