'use strict';

var React = require('react/addons');
var BrowserActionApp = React.createFactory(require('./components/BrowserActionApp'));
var mountNode = document.getElementById('react-main-mount');

var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

background.loadToken(function (accessToken) {

  background.loadNotifications(function (notifications) {

    console.log('browserAction', accessToken, notifications);

    var browserActionApp = new BrowserActionApp({
      'notifications': notifications,
      'loggedIn': !!accessToken
    });

    React.render(browserActionApp, mountNode);
  });
});