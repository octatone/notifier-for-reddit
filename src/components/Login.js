'use strict';

var React = require('react/addons');
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();

var Login = React.createClass({

  'login': function () {

    console.log('login clicked');
    background.login();
  },

  'render': function () {

    return (
      <div className="login">
        <button onClick={this.login}>Login</button>
      </div>
    );
  }
});

module.exports = Login;