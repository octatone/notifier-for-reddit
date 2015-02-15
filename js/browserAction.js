(function () {

  var background = chrome.extension.getBackgroundPage();
  var notificationViews = [];

  var View = Backbone.View;
  var _superView = View.prototype;

  var NotificationView = View.extend({

    'tagName': 'li',

    'className': 'notification',

    'events': {},

    'render': function (data) {

      var self = this;

      var header = data.subject + ' from ' + data.author;
      var body =  _.unescape(data.body_html);
      body = body.replace(/href="/gi, 'target="_blank" href="');
      body = body.replace(/href="\/r\//gi, 'href="https://www.reddit.com/r/');
      var footer = data.link_title
      var link = data.context;
      link = link ? 'https://www.reddit.com' + link : undefined;

      var template = '' +
        '<div class="header">' + header +
        '</div>' +
        '<div class="body">' + body +
        '</div>';

      if (footer && link) {
        template += '' +
          '<div class="footer">' +
          '  <a href="' + link + '" target="_blank">' +
              're: ' + footer +
          '  </a>' +
          '</div>';
      }

      self.$el.html(template);
      return self;
    }
  });

  function renderNotifications () {

    var $notifications = $('ul.notifications');

    notificationViews.forEach(function (view) {

      view.remove();
    });

    var docFragment = document.createDocumentFragment();
    var notifications = background.currentNotifications;
    notifications.forEach(function (data) {

      var view = new NotificationView();
      notificationViews.push(view);
      docFragment.appendChild(view.render(data.data).el);
    });

    $notifications.append(docFragment)
  }

  $(function () {

    $('.login button').on('click', function (ev) {

      console.log('login clicked');
      background.login();
    });

    renderNotifications();
  });

})();