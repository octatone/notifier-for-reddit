'use strict';

var React = require('react/addons');
var classnames = require('classnames');

var NotificationItem = React.createClass({

  'renderFooter': function () {

    var props = this.props;
    var footer = props.link_title;
    var link = props.context;
    link = link ? 'https://www.reddit.com' + link : undefined;

    if (footer && link) {
      return (
        <div className='footer'>
          <a href={link} target='_blank'>
            re: {footer}
          </a>
        </div>
      );
    }
  },

  'render': function () {

    var self = this;
    var props = self.props;

    var unread = !!props.new;

    var header = props.subject + ' from ' + props.author;
    var body =  _.unescape(props.body_html);
    body = body.replace(/href="/gi, 'target="_blank" href="');
    body = body.replace(/href="\/r\//gi, 'href="https://www.reddit.com/r/');
    var footer = self.renderFooter();

    var liClasses = classnames(
      'notification',
      {
        'unread': unread
      }
    );

    return (
      <li className={liClasses}>
        <div className='header'>
          {header}
        </div>
        <div className='body' dangerouslySetInnerHTML={{'__html': body}}/>
        {footer}
      </li>
    );
  }
});

module.exports = NotificationItem;