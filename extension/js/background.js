'use strict';

var chrome = window.chrome;
var clientID = 'Caq9b9StS2HEVA';
var authURL = 'https://www.reddit.com/api/v1/authorize';
var apiBase = 'https://oauth.reddit.com';
var redirectURI = 'https://odmoedfabaohbdoiolgfhedcbfpcindh.chromiumapp.org/provider_cb';
var exchangeProxy = 'http://reddit-notifier-oauth-exchange.herokuapp.com';
var storage = chrome.storage.sync;
var pollInterval = 15 * 1000;
var timeout = 30 * 1000;

var notifiedIds = {};
var currentNotifications = [];
var currentTimeout;

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

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (info) {

    var headers = info.requestHeaders;
    var meHeader = 'x-reddit-notifier';
    var isSelf = info.requestHeaders.filter(function (data) {

      return data.name === meHeader;
    });

    if (isSelf.length) {
      headers.forEach(function (header) {

        if (header.name.toLowerCase() === 'user-agent') {
          header.value = getUserAgentString();
        }
      });
    }

    return {'requestHeaders': headers};
  },
  {
    'urls': [
      'https://oauth.reddit.com/*',
    ],
    'types': [
      'xmlhttprequest'
    ],
    'tabId': -1
  },
  [
    'blocking',
    'requestHeaders'
  ]
);

function findNotification (notificationID) {

  var notification;
  currentNotifications.forEach(function (data) {

    if (data.data.id === notificationID) {
      notification = data.data;
    }
  });

  return notification;
}

chrome.notifications.onClicked.addListener(function (notificationID) {

  var notification = findNotification(notificationID);
  var url;

  if (notification && notification.was_comment) {
    url = 'https://www.reddit.com' + notification.context;
  }
  else if (notification && !notification.was_comment) {
    url = 'https://www.reddit.com/message/inbox/'
  }

  url && chrome.tabs.create({
    'url': url
  });

  markCommentRead(notification.name);
});

function getParams (uri) {

  var params = {};
  var parts = uri.split('?');
  var queries = parts[1].split('&');
  queries.forEach(function (query) {
    var kv = query.split('=');
    var key = kv[0];
    var value = kv[1];

    params[key] = decodeURIComponent(value);
  });

  return params;
}

function getUserAgentString () {

  var version = chrome.runtime.getManifest().version;
  return 'chrome-extension:notifier-for-reddit:' + version + ' (by /u/octatone)';
}

function getAuthURL (state) {

  var options = {
    'client_id': clientID,
    'response_type': 'code',
    'duration': 'permanent',
    'redirect_uri': redirectURI,
    'scope': 'privatemessages',
    'state': state
  };

  var parts = [];
  for (var key in options) {
    parts.push(key + '=' + encodeURIComponent(options[key]));
  }

  return authURL + '?' + parts.join('&');
}

function saveTokenData (data) {

  var saveData = {};

  data.access_token && (saveData.accessToken = data.access_token);
  data.refresh_token && (saveData.refreshToken = data.refresh_token);

  if (data.expires_in) {
    var now = Date.now();
    saveData.expiration = now + (data.expires_in * 1000) - 60000;
  }

  storage.set(saveData);
}

function exchangeCode (code, callback) {

  $.ajax(exchangeProxy + '/exchange', {
    'type': 'POST',
    'data': {
      'code': code
    },
    'timeout': timeout
  })
  .always(function (response) {

    if (response && response.access_token) {
      saveTokenData(response);
      callback && callback(response.access_token);
    }
  });
}

function exchangeRefreshToken (refreshToken, callback) {

  var accessToken;

  $.post(exchangeProxy + '/token', {
    'refreshToken': refreshToken
  })
  .always(function (response) {

    if (response && response.access_token) {
      saveTokenData(response);
      accessToken = response.access_token;
    }

    callback && callback(accessToken);
  });
}

function login () {

  var state = ''+ Math.random();

  chrome.identity.launchWebAuthFlow({
    'url': getAuthURL(state),
    'interactive': true
  },
  function (redirectURL) {

    var params = getParams(redirectURL);
    if (params.state === state && params.code) {
      exchangeCode(params.code, poll);
    }
  });
}

function logout () {

  storage.remove([
    'accessToken',
    'refreshToken',
    'expiration'
  ]);

  currentNotifications = [];
}

function fetchToken (callback) {

  storage.get([
    'accessToken',
    'refreshToken',
    'expiration'
  ], function (data) {

    var accessToken = data.accessToken;
    var refreshToken = data.refreshToken;
    var expiration = data.expiration;
    var now = Date.now();

    if (accessToken && expiration > now) {
      console.log('token still valid');
      callback(accessToken);
    }
    else if (refreshToken) {
      console.log('token expired');
      exchangeRefreshToken(refreshToken, callback);
    }
    else {
      callback();
    }
  });
}

function createNotification (data) {

  chrome.notifications.create(
    data.id,
    {
      'type': 'basic',
      'iconUrl': '../icons/reddit-alien.svg',
      'title': data.subject + ' from ' + data.author,
      'message': data.body,
      'contextMessage': data.link_title
    },
    function () {
      chrome.runtime.lastError && console.error(chrome.runtime.lastError);
    }
  );
}

function updateBadge (unreadCount) {

  chrome.browserAction.setBadgeText({
    'text': unreadCount > 0 ? '' + unreadCount : ''
  });
}

function updateIcon (unreadCount) {

  var base = '../icons/envelope_' + (unreadCount > 0 ? 'unread' : 'read');

  chrome.browserAction.setIcon({
    'path': {
      '19': base + '_19.png',
      '38': base + '_38.png'
    }
  });
}

function handleInboxData (data) {

  var unread = 0;

  currentNotifications = data;
  currentNotifications.forEach(function (data) {

    var notificationData = data.data;
    var isNotNotified = !notifiedIds[notificationData.id];
    var isNew = notificationData['new'];

    if (isNew) {
      if (isNotNotified) {
        createNotification(notificationData);
        notifiedIds[notificationData.id] = true;
      }
      unread += 1;
    }
    else if (!isNew) {
      // cleanup notified ids tracker
      // don't let it grow infinitely
      delete notifiedIds[notificationData.id];
    }
  });

  chrome.runtime.sendMessage({'notifications': 'update'});

  updateIcon(unread);
  updateBadge(unread);
}

function fetchInbox (accessToken) {

  var request = $.ajax(apiBase + '/message/inbox.json?mark=false', {
    'headers': {
      'x-reddit-notifier': 'true',
      'Authorization': 'bearer '  + accessToken
    },
    'timeout': timeout
  })
  .always(function (response) {

    if (response && response.kind === 'Listing') {
      handleInboxData(response.data.children);
    }
  });

  return request;
}

function markCommentRead (id) {

  fetchToken(function (accessToken) {

    $.ajax(apiBase + '/api/read_message', {
      'method': 'POST',
      'headers': {
        'x-reddit-notifier': 'true',
        'Authorization': 'bearer '  + accessToken
      },
      'timeout': timeout,
      'data': {
        'id': id
      }
    })
    .done(function (response) {

      poll();
    });
  });
}

function clearCurrentTimeout () {

  currentTimeout && clearTimeout(currentTimeout);
}

function setNextPoll () {

  clearCurrentTimeout();
  currentTimeout = setTimeout(poll, pollInterval);
}

function poll () {

  clearCurrentTimeout();

  fetchToken(function (accessToken) {

    if (accessToken) {
      console.log('using token:', accessToken);
      fetchInbox(accessToken).always(setNextPoll);
    }
    else {
      console.log('no token waiting ...');
      setNextPoll();
    }
  });
}

poll();