(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var React = require("react/addons");
var NotificationsList = require("./NotificationsList");
var Login = require("./Login");
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

var BrowserActionApp = React.createClass({
  displayName: "BrowserActionApp",

  updateNotifications: function updateNotifications() {

    this.setProps({
      notifications: background.currentNotifications
    });
  },

  bindToStorage: function bindToStorage() {

    var self = this;

    chrome.storage.onChanged.addListener(function (changes, namespace) {

      for (var key in changes) {
        var storageChange = changes[key];
        console.log("Storage key \"%s\" in namespace \"%s\" changed. " + "Old value was \"%s\", new value is \"%s\".", key, namespace, storageChange.oldValue, storageChange.newValue);
      }
    });

    chrome.runtime.onMessage.addListener(function (request, sender) {

      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

      if (request.notifications === "update") {
        self.updateNotifications();
      }
    });
  },

  componentDidMount: function componentDidMount() {

    this.bindToStorage();
  },

  render: function render() {

    var props = this.props;

    if (props.loggedIn) {
      return React.createElement(NotificationsList, props);
    } else {
      return React.createElement(Login, null);
    }
  }
});

module.exports = BrowserActionApp;


},{"./Login":2,"./NotificationsList":4,"react/addons":"yutbdK"}],2:[function(require,module,exports){
"use strict";

var React = require("react/addons");
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

var Login = React.createClass({
  displayName: "Login",

  login: function login() {

    console.log("login clicked");
    background.login();
  },

  render: function render() {

    return React.createElement(
      "div",
      { className: "login" },
      React.createElement(
        "button",
        { onClick: this.login },
        "Login"
      )
    );
  }
});

module.exports = Login;


},{"react/addons":"yutbdK"}],3:[function(require,module,exports){
"use strict";

var React = require("react/addons");

var NotificationItem = React.createClass({
  displayName: "NotificationItem",

  renderFooter: function renderFooter() {

    var props = this.props;
    var footer = props.link_title;
    var link = props.context;
    link = link ? "https://www.reddit.com" + link : undefined;

    if (footer && link) {
      return React.createElement(
        "div",
        { className: "footer" },
        React.createElement(
          "a",
          { href: link, target: "_blank" },
          "re: ",
          footer
        )
      );
    }
  },

  render: function render() {

    var self = this;
    var props = self.props;

    var header = props.subject + " from " + props.author;
    var body = _.unescape(props.body_html);
    body = body.replace(/href="/gi, "target=\"_blank\" href=\"");
    body = body.replace(/href="\/r\//gi, "href=\"https://www.reddit.com/r/");
    var footer = self.renderFooter();

    return React.createElement(
      "li",
      { className: "notification" },
      React.createElement(
        "div",
        { className: "header" },
        header
      ),
      React.createElement("div", { className: "body", dangerouslySetInnerHTML: { __html: body } }),
      footer
    );
  }
});

module.exports = NotificationItem;


},{"react/addons":"yutbdK"}],4:[function(require,module,exports){
"use strict";

var React = require("react/addons");
var NotificationItem = require("./NotificationItem");

var NotificationsList = React.createClass({
  displayName: "NotificationsList",

  render: function render() {

    var props = this.props;
    var notifications = props.notifications;
    var notificationItems = notifications.map(function (notification) {

      return React.createElement(NotificationItem, notification.data);
    });

    return React.createElement(
      "ul",
      { className: "notifications" },
      notificationItems
    );
  }
});

module.exports = NotificationsList;


},{"./NotificationItem":3,"react/addons":"yutbdK"}],5:[function(require,module,exports){
"use strict";

var React = require("react/addons");
var BrowserActionApp = React.createFactory(require("./components/BrowserActionApp"));
var mountNode = document.getElementById("react-main-mount");

var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();
var notifications = background.currentNotifications;

background.fetchToken(function (accessToken) {

  console.log("browserAction", accessToken);

  var browserActionApp = new BrowserActionApp({
    notifications: notifications,
    loggedIn: !!accessToken
  });

  React.render(browserActionApp, mountNode);
});


},{"./components/BrowserActionApp":1,"react/addons":"yutbdK"}]},{},[5])