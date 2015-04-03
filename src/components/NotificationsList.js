'use strict';

var React = require('react/addons');
var NotificationItem = require('./NotificationItem');

var NotificationsList = React.createClass({
  'render': function () {

    var props = this.props;
    var notifications = props.notifications;
    var notificationItems = notifications.map(function (notification) {

      var data = notification.data;
      return <NotificationItem {...data} key={data.name}/>
    });

    return (
      <ul className="notifications">
        {notificationItems}
      </ul>
    );
  }
});

module.exports = NotificationsList;