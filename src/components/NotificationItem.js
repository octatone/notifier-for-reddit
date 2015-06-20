'use strict';

var React = require('react/addons');
var classnames = require('classnames');
var moment = require('moment');
var chrome = window.chrome;
var background = chrome.extension.getBackgroundPage();
var _ = window._;

var NotificationItem = React.createClass({

  'isUnread': function () {

    return !!this.props.new;
  },

  'markAsRead': function () {

    var self = this;
    var props = self.props;
    var name = props.name;
    if (self.isUnread()) {
      background.markCommentRead(name);
    }
  },

  'renderTitle': function () {

    var props = this.props;
    var context = props.context;
    if (context) {
      return  props.subject + ' from ' + props.author;
    }
    else {
      var url = 'https://www.reddit.com/message/messages/' + props.id;
      return (
        <div>
          inbox message from {props.author}<br/>
          <a href={url} target='_blank'>{props.subject}</a>
        </div>
      )
    }
  },

  'renderContext': function () {

    var props = this.props;
    var linkTitle = props.link_title;
    var link = props.context;
    link = link ? 'https://www.reddit.com' + link : undefined;
    if (linkTitle && link) {
      return (
        <div className='context'>
          <a href={link} target='_blank'>
            re: {linkTitle}
          </a>
        </div>
      );
    }
  },

  'render': function () {

    var self = this;
    var props = self.props;

    var unread = self.isUnread();
    var title = self.renderTitle();
    var body =  _.unescape(props.body_html);
    body = body.replace(/href="/gi, 'target="_blank" href="');
    body = body.replace(/href="\/r\//gi, 'href="https://www.reddit.com/r/');
    var context = self.renderContext();
    var timestamp = moment.utc(props.created_utc * 1000).local().fromNow();

    var liClasses = classnames(
      'notification',
      {
        'unread': unread
      }
    );

    return (
      <li className={liClasses} onClick={self.markAsRead}>
        <div className='header'>
          <div className='title'>
            {title}
          </div>
          {context}
          <div className='timestamp'>
            {timestamp}
          </div>
        </div>
        <div className='body' dangerouslySetInnerHTML={{'__html': body}}/>
      </li>
    );
  }
});

module.exports = NotificationItem;