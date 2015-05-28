'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const Menu = require('menu');

// report crashes to the Electron project
require('crash-reporter').start();

// prevent window being GC'd
let mainWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        // https://github.com/atom/electron/blob/master/docs/api/browser-window.md
        'min-width': 1000,
        'min-height': 400,
        width: 1200,
        height: 600,
        center: true,
        resizable: true
    });

    mainWindow.loadUrl(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function() {
        // deref the window
        // for multiple windows store them in an array
        mainWindow = null;
    });

    // uncomment the below line to open devetools
    //mainWindow.openDevTools();
});

// does not work when placed on top for some reason.
app.on('window-all-closed', function() {
    app.quit();
});
