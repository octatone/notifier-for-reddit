'use strict';

var React = require('react/addons');
var NotificationsList = require('./NotificationsList');
var Login = require('./Login');
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

var BrowserActionApp = React.createClass({

  'updateNotifications': function () {

    this.setProps({
      'notifications': background.currentNotifications
    });
  },

  'bindToStorage': function () {

    var self = this;

    chrome.storage.onChanged.addListener(function (changes, namespace) {

      for (var key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
                    'Old value was "%s", new value is "%s".',
                    key,
                    namespace,
                    storageChange.oldValue,
                    storageChange.newValue);
      }
    });

    chrome.runtime.onMessage.addListener(function (request, sender) {

      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");

      if (request.notifications === 'update') {
        self.updateNotifications();
      }
    });
  },

  'componentDidMount': function () {

    this.bindToStorage();
  },

  'render': function () {

    var props = this.props;

    if (props.loggedIn) {
      return <NotificationsList {...props}/>;
    }
    else {
      return <Login/>;
    }
  }
});

module.exports = BrowserActionApp;