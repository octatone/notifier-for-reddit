(function () {

  var background = chrome.extension.getBackgroundPage();
  var notificationViews = [];

  var View = Backbone.View;
  var _superView = View.prototype;

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
      renderNotifications();
    }
  });

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
      var footer = data.link_title;
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

    $notifications.append(docFragment);
  }

  $(function () {

    var $loginPage = $('.login');
    var $inbox = $('.inbox');

    $('.login button').on('click', function () {

      console.log('login clicked');
      background.login();
    });

    $('.logout button').on('click', function () {

      console.log('logout clicked');
      background.logout();
    });

    background.fetchToken(function (accessToken) {

      console.log('browserAction', accessToken);
      if (accessToken) {
        $inbox.removeClass('hidden');
        renderNotifications();
      }
      else {
        $loginPage.removeClass('hidden');
      }
    });
  });
})();