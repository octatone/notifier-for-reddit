'use strict';

var React = require('react/addons');
var NotificationsList = require('./NotificationsList');
var Login = require('./Login');
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

var BrowserActionApp = React.createClass({

  'updateNotifications': function (notifications) {

    console.log(notifications)

    this.setProps({
      'notifications': notifications
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

      if ('notifications' in changes) {
        self.updateNotifications(changes.notifications);
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